/**
 * Web app URL of the Apps Script deployed from the content Google Sheet (cms/HUONG-DAN.md, step 3).
 * It is public by design: browsers post orders to it. Leave empty to run on built-in sample content
 * with ordering switched off.
 */
export const CMS_URL =
  process.env.NEXT_PUBLIC_CMS_URL ||
  "https://script.google.com/macros/s/AKfycbw4VxS9dqM05Zdlsh584AXLWZuSqFRTzSAZfPKFVJvCBH-G5u9lt2TNg5VePkFWSqc7/exec";

/** Seconds before an edit in the sheet shows up on the site. */
export const CONTENT_REVALIDATE_SECONDS = 60;
