import QRCode from "qrcode";

const PRINT_SIZE = 1024;

/** Public menu URL encoded into each restaurant's QR. */
export function restaurantMenuUrl(slug: string) {
  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${origin}/${slug}`;
}

function printReadySvg(svg: string) {
  const size = svg.match(/\bwidth="(\d+(?:\.\d+)?)"/)?.[1] ?? String(PRINT_SIZE);
  let next = svg;
  if (!/\bviewBox=/.test(next)) {
    next = next.replace("<svg", `<svg viewBox="0 0 ${size} ${size}"`);
  }
  return next
    .replace(/\swidth="[^"]*"/, ' width="100%"')
    .replace(/\sheight="[^"]*"/, ' height="100%"')
    .replace(
      "<svg",
      '<svg preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges"',
    );
}

export type MenuQr = {
  menuUrl: string;
  menuQrSvg: string;
};

/**
 * High-contrast SVG QR for physical print (table tents, window stickers).
 * Quiet zone = 4 modules; error correction H survives partial scuffs.
 */
export async function generateMenuQr(slug: string): Promise<MenuQr> {
  const menuUrl = restaurantMenuUrl(slug);
  const raw = await QRCode.toString(menuUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    width: PRINT_SIZE,
    color: {
      dark: "#111111",
      light: "#FFFFFF",
    },
  });
  return { menuUrl, menuQrSvg: printReadySvg(raw) };
}

export function menuQrDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
