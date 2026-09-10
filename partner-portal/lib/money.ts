export function paiseToRupees(paise: number): string {
  const value = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function gstFromBps(amountPaise: number, taxRateBps: number): number {
  return Math.round((amountPaise * taxRateBps) / 10000);
}

export type OrderMoneyInput = {
  subtotalPaise: number;
  discountPaise?: number;
  packagingFeePaise?: number;
  deliveryFeePaise?: number;
  platformFeePaise?: number;
  gstPaise?: number;
  gatewayFeePaise?: number;
};

export function settleOrderMoney(input: OrderMoneyInput) {
  const discountPaise = input.discountPaise ?? 0;
  const packagingFeePaise = input.packagingFeePaise ?? 0;
  const deliveryFeePaise = input.deliveryFeePaise ?? 0;
  const platformFeePaise = input.platformFeePaise ?? 0;
  const gstPaise = input.gstPaise ?? 0;
  const gatewayFeePaise = input.gatewayFeePaise ?? 0;
  const totalPaise =
    input.subtotalPaise -
    discountPaise +
    packagingFeePaise +
    deliveryFeePaise +
    platformFeePaise +
    gstPaise;
  const netPayoutPaise = totalPaise - platformFeePaise - gatewayFeePaise;
  return {
    discountPaise,
    packagingFeePaise,
    deliveryFeePaise,
    platformFeePaise,
    gstPaise,
    gatewayFeePaise,
    totalPaise,
    netPayoutPaise,
  };
}
