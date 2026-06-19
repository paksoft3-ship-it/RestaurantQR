import { describe, it, expect } from "vitest";
import { GET } from "./route";

function call(slug: string) {
  return GET(new Request("http://localhost/api"), { params: Promise.resolve({ restaurantSlug: slug }) });
}

describe("vCard contact-card route", () => {
  it("returns a UTF-8 vCard with the right content type + filename for a known restaurant", async () => {
    const res = await call("pizza-house");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/vcard; charset=utf-8");
    expect(res.headers.get("content-disposition")).toContain("pizza-house-contact.vcf");
    const body = await res.text();
    expect(body.startsWith("BEGIN:VCARD")).toBe(true);
    expect(body).toContain("VERSION:3.0");
    expect(body).toContain("FN:Pizza House");
    expect(body).toContain("TEL;");
    expect(body.endsWith("END:VCARD\r\n")).toBe(true);
    // CRLF line endings
    expect(body.includes("\r\n")).toBe(true);
  });

  it("never leaks internal notes / private fields", async () => {
    const res = await call("pizza-house");
    const body = await res.text();
    expect(body.toLowerCase()).not.toContain("internal");
    expect(body.toLowerCase()).not.toContain("note");
  });

  it("returns 404 for an unknown restaurant", async () => {
    const res = await call("does-not-exist");
    expect(res.status).toBe(404);
  });
});
