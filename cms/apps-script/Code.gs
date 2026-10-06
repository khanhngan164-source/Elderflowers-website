/**
 * Elderflowers Garden — backend for the website, running inside the Google Sheet.
 *
 *   GET  ?action=content  → public website content (settings + content tabs) as JSON
 *   POST {type:"order"|"booking"|"newsletter", ...} → validates, records a row, emails the shop
 *
 * Install: open the Sheet → Extensions → Apps Script → replace everything with this file → Deploy
 * → New deployment → Web app → Execute as: Me, Who has access: Anyone. See cms/HUONG-DAN.md.
 *
 * Tab and column names must match cms/schema.json (a unit test checks this file against it).
 * Prices are ALWAYS recomputed here from the sheet; totals sent by the browser are ignored.
 */

var SETTINGS_SHEET = 'CaiDat';
var PRIVATE_SETTINGS = ['order_email'];
var CONTENT_SHEETS = ['SanPham', 'NguyenLieu', 'CauChuyen', 'CongThuc', 'HopHoa', 'TraiNghiem'];
var COL = {
  productId: 'Mã', productName: 'Tên (EN)', productPrice: 'Giá (₫)', productVisible: 'Hiển thị', productSize: 'Quy cách',
  boxName: 'Tên', boxPrice: 'Giá (₫)',
  expName: 'Tên (EN)', expPrice: 'Giá / khách (₫)'
};
var RECORDS = {
  orders: { sheet: 'DonHang', columns: ['Thời gian', 'Mã đơn', 'Trạng thái', 'Họ tên', 'SĐT', 'Địa chỉ', 'Khung giờ', 'Thanh toán', 'Sản phẩm', 'Gói quà', 'Lời nhắn', 'Tạm tính', 'Phí giao', 'Phí gói', 'Tổng'] },
  bookings: { sheet: 'DatLich', columns: ['Thời gian', 'Mã', 'Trạng thái', 'Họ tên', 'SĐT', 'Trải nghiệm', 'Ngày', 'Số khách', 'Tổng'] },
  newsletter: { sheet: 'DangKyThu', columns: ['Thời gian', 'Email'] }
};
var BOX_FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly'];
var MAX_QTY = 9, MAX_LINES = 30, MAX_GUESTS = 8, NOTE_MAX = 160;

// ---------------------------------------------------------------- web endpoints

function doGet(e) {
  try {
    return json_(publicContent_(readContent_()));
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = e && e.postData && e.postData.contents || '';
    if (body.length > 20000) throw new UserError('Yêu cầu quá lớn.');
    var payload = JSON.parse(body);
    if (payload.website) return json_({ ok: true, ref: 'EG-00000' }); // honeypot: bots fill hidden fields

    var content = readContent_();
    lock.waitLock(20000);
    var result;
    if (payload.type === 'order') result = recordOrder_(content, payload);
    else if (payload.type === 'booking') result = recordBooking_(content, payload);
    else if (payload.type === 'newsletter') result = recordNewsletter_(payload);
    else throw new UserError('Unknown request.');
    return json_(result);
  } catch (err) {
    var msg = err instanceof UserError ? err.message : 'Có lỗi xảy ra, vui lòng thử lại hoặc nhắn Zalo cho shop.';
    if (!(err instanceof UserError)) console.error(err);
    return json_({ ok: false, error: msg });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

// ---------------------------------------------------------------- pure logic (unit-tested)

function UserError(message) { this.message = message; }
UserError.prototype = Object.create(Error.prototype);

function toNumber(v) { return Number(String(v == null ? '' : v).replace(/[^\d]/g, '')) || 0; }
function clean(v, max) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max || 200); }
function isHidden(v) { return /^(không|khong|no|false|ẩn|an|0)$/i.test(clean(v)); }
function formatVnd(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }

function validateContact(p) {
  var name = clean(p.name, 80), phone = clean(p.phone, 20).replace(/\s/g, '');
  if (name.length < 2) throw new UserError('Vui lòng nhập họ tên.');
  if (!/^0\d{9}$/.test(phone)) throw new UserError('Số điện thoại chưa đúng (10 số, VD 0901234567).');
  return { name: name, phone: phone };
}

function fees(settings) {
  return {
    delivery: toNumber(settings.delivery_fee),
    freeFrom: toNumber(settings.free_delivery_from),
    wrap: toNumber(settings.wrap_fee)
  };
}

/** Recompute an order from the sheet. Throws UserError for anything a customer should fix. */
function computeOrder(content, p) {
  var contact = validateContact(p);
  var address = clean(p.address, 300);
  if (address.length < 8) throw new UserError('Vui lòng nhập địa chỉ đầy đủ.');
  var items = Array.isArray(p.items) ? p.items : [];
  if (!items.length) throw new UserError('Giỏ hàng đang trống.');
  if (items.length > MAX_LINES) throw new UserError('Đơn hàng có quá nhiều dòng.');

  var products = content.tabs.SanPham || [], boxes = content.tabs.HopHoa || [];
  var lines = items.map(function (it) {
    var key = clean(it.key, 120), qty = Math.floor(Number(it.qty));
    if (!(qty >= 1 && qty <= MAX_QTY)) throw new UserError('Số lượng không hợp lệ.');
    if (key.indexOf('box:') === 0) {
      var parts = key.split(':'), freq = BOX_FREQUENCIES[Number(parts[2])];
      var box = boxes.filter(function (b) { return clean(b[COL.boxName]) === parts[1]; })[0];
      if (!box || !freq || !toNumber(box[COL.boxPrice])) throw new UserError('Hộp hoa này không còn, vui lòng chọn lại.');
      return { label: box[COL.boxName] + ' Flower Box (' + freq + ')', qty: qty, price: toNumber(box[COL.boxPrice]) };
    }
    var prod = products.filter(function (r) { return clean(r[COL.productId]) === key; })[0];
    if (!prod || isHidden(prod[COL.productVisible]) || !toNumber(prod[COL.productPrice])) {
      throw new UserError('Một sản phẩm trong giỏ không còn bán. Vui lòng tải lại trang.');
    }
    return { label: clean(prod[COL.productName]) + (prod[COL.productSize] ? ' · ' + clean(prod[COL.productSize]) : ''), qty: qty, price: toNumber(prod[COL.productPrice]) };
  });

  var f = fees(content.settings);
  var subtotal = lines.reduce(function (a, l) { return a + l.price * l.qty; }, 0);
  var wrap = !!p.wrap;
  var wrapFee = wrap ? f.wrap : 0;
  var delivery = subtotal >= f.freeFrom ? 0 : f.delivery;
  var pay = p.pay === 'transfer' && content.settings.bank_id && content.settings.bank_account ? 'Chuyển khoản' : 'COD';
  return {
    name: contact.name, phone: contact.phone, address: address,
    slot: clean(p.slot, 60), pay: pay, wrap: wrap, note: wrap ? clean(p.wrapNote, NOTE_MAX) : '',
    lines: lines, subtotal: subtotal, wrapFee: wrapFee, delivery: delivery, total: subtotal + wrapFee + delivery
  };
}

function computeBooking(content, p, today) {
  var contact = validateContact(p);
  var exps = content.tabs.TraiNghiem || [];
  var exp = exps.filter(function (r) { return clean(r[COL.expName]) === clean(p.experience); })[0];
  if (!exp || !toNumber(exp[COL.expPrice])) throw new UserError('Trải nghiệm này không còn, vui lòng chọn lại.');
  var guests = Math.floor(Number(p.guests));
  if (!(guests >= 1 && guests <= MAX_GUESTS)) throw new UserError('Số khách từ 1 đến ' + MAX_GUESTS + '.');
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(p.date));
  if (!m) throw new UserError('Ngày không hợp lệ.');
  var date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  var day = date.getUTCDay();
  if ([0, 5, 6].indexOf(day) < 0) throw new UserError('Vườn chỉ mở thứ Sáu đến Chủ nhật.');
  var todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getTime() <= todayUtc) throw new UserError('Vui lòng chọn một ngày sắp tới.');
  return {
    name: contact.name, phone: contact.phone, experience: clean(exp[COL.expName]),
    date: m[3] + '/' + m[2] + '/' + m[1], guests: guests, total: toNumber(exp[COL.expPrice]) * guests
  };
}

function validEmail(v) {
  var email = clean(v, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new UserError('Email chưa đúng.');
  return email;
}

/** Google Drive share link → direct image URL (the file is made link-viewable separately). */
function driveFileId(v) {
  var m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/.exec(String(v || ''));
  return m ? m[1] : '';
}

function publicContent_(content) {
  var settings = {};
  Object.keys(content.settings).forEach(function (k) {
    if (PRIVATE_SETTINGS.indexOf(k) < 0) settings[k] = content.settings[k];
  });
  return { ok: true, settings: settings, tabs: content.tabs };
}

// ---------------------------------------------------------------- Google services

function readContent_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settings = {};
  var s = ss.getSheetByName(SETTINGS_SHEET);
  if (s) {
    s.getDataRange().getDisplayValues().slice(1).forEach(function (r) {
      if (r[0]) settings[clean(r[0])] = String(r[1]).trim();
    });
  }
  var tabs = {};
  CONTENT_SHEETS.forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) return;
    var values = sh.getDataRange().getDisplayValues();
    var headers = values[0].map(function (h) { return clean(h); });
    tabs[name] = values.slice(1)
      .filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); })
      .map(function (r) {
        var o = {};
        headers.forEach(function (h, i) { if (h) o[h] = String(r[i]).trim(); });
        return o;
      });
  });
  shareImages_(settings, tabs);
  return { settings: settings, tabs: tabs };
}

/** Make Drive images referenced by the sheet viewable by anyone with the link (cached 6h). */
function shareImages_(settings, tabs) {
  var urls = [];
  Object.keys(settings).forEach(function (k) { if (/_image$/.test(k)) urls.push(settings[k]); });
  Object.keys(tabs).forEach(function (t) {
    tabs[t].forEach(function (row) { Object.keys(row).forEach(function (h) { if (/^Ảnh/.test(h)) urls.push(row[h]); }); });
  });
  var cache = CacheService.getScriptCache();
  urls.map(driveFileId).filter(String).forEach(function (id) {
    if (cache.get('shared:' + id)) return;
    try {
      var file = DriveApp.getFileById(id);
      if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK && file.getSharingAccess() !== DriveApp.Access.ANYONE) {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
      cache.put('shared:' + id, '1', 21600);
    } catch (err) {
      console.warn('Cannot share image ' + id + ': ' + err);
    }
  });
}

function sheetFor_(rec) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(rec.sheet);
  if (!sh) {
    sh = ss.insertSheet(rec.sheet);
    sh.appendRow(rec.columns);
    sh.setFrozenRows(1);
  }
  return sh;
}

function nextRef_(sh, prefix, base) {
  return prefix + (base + Math.max(0, sh.getLastRow() - 1) + 1);
}

function notify_(content, subject, body) {
  var to = content.settings.order_email;
  if (!to) return;
  try { MailApp.sendEmail({ to: to, subject: subject, body: body }); } catch (err) { console.error('Email failed: ' + err); }
}

function recordOrder_(content, p) {
  var o = computeOrder(content, p);
  var sh = sheetFor_(RECORDS.orders);
  var ref = nextRef_(sh, 'EG-', 20500);
  var items = o.lines.map(function (l) { return l.label + ' ×' + l.qty; }).join('\n');
  sh.appendRow([new Date(), ref, 'Mới', o.name, "'" + o.phone, o.address, o.slot, o.pay, items, o.wrap ? 'Có' : '', o.note, o.subtotal, o.delivery, o.wrapFee, o.total]);
  notify_(content, '🌿 Đơn mới ' + ref + ' — ' + formatVnd(o.total),
    'Đơn hàng mới từ website\n\n' + ref + '\n' + o.name + ' · ' + o.phone + '\n' + o.address +
    '\nKhung giờ: ' + o.slot + '\nThanh toán: ' + o.pay + '\n\n' + items +
    (o.wrap ? '\n\nGói quà. Lời nhắn: ' + (o.note || '(trống)') : '') +
    '\n\nTạm tính: ' + formatVnd(o.subtotal) + '\nPhí giao: ' + formatVnd(o.delivery) + '\nPhí gói: ' + formatVnd(o.wrapFee) +
    '\nTỔNG: ' + formatVnd(o.total) + '\n\nXem tất cả đơn: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  var s = content.settings;
  return {
    ok: true, ref: ref, total: o.total, pay: o.pay,
    bank: o.pay === 'Chuyển khoản' ? { id: s.bank_id, account: s.bank_account, name: s.bank_name } : null
  };
}

function recordBooking_(content, p) {
  var b = computeBooking(content, p, new Date());
  var sh = sheetFor_(RECORDS.bookings);
  var ref = nextRef_(sh, 'EV-', 1000);
  sh.appendRow([new Date(), ref, 'Mới', b.name, "'" + b.phone, b.experience, b.date, b.guests, b.total]);
  notify_(content, '🌿 Đặt lịch ghé vườn ' + ref + ' — ' + b.date,
    b.name + ' · ' + b.phone + '\n' + b.experience + '\nNgày: ' + b.date + '\nSố khách: ' + b.guests + '\nTổng: ' + formatVnd(b.total));
  return { ok: true, ref: ref, total: b.total };
}

function recordNewsletter_(p) {
  var email = validEmail(p.email);
  sheetFor_(RECORDS.newsletter).appendRow([new Date(), email]);
  return { ok: true };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor (▶ Run) to grant permissions and check the setup. */
function kiemTra() {
  var c = readContent_();
  Logger.log('Sản phẩm: ' + (c.tabs.SanPham || []).length + ', email nhận đơn: ' + (c.settings.order_email || '(chưa có)'));
  MailApp.getRemainingDailyQuota();
}
