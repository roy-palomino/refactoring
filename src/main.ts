import plays from "./data/plays.json";
import invoices from "./data/invoices.json";
import { Invoice, Performance, Play } from "./types";

export function statement(invoice: Invoice, plays: any) {
  let totalAmount = 0;
  let result = `Statement for ${invoice.customer}\n`;
  let volumeCredits = 0;

  for (let perf of invoice.performances) {
    volumeCredits += volumeCreditsFor(perf);

    result += ` ${playFor(perf).name}: ${format(amountFor(perf) / 100)} (${
      perf.audience
    } seats)\n`;
    totalAmount += amountFor(perf);
  }

  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;

  // EXTRACTED FUNCTIONS
  function amountFor(aPerformance: Performance) {
    let result = 0;
    switch (playFor(aPerformance).type) {
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;

      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;

      default:
        throw new Error(`Unknown type: ${playFor(aPerformance).type}`);
    }

    return result;
  }


  function playFor(aPerformance: Performance): Play {
    return plays[aPerformance.playID];
  }

  function volumeCreditsFor(aPerformance: Performance): number {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" == playFor(aPerformance).type) result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  function format (aNumber: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(aNumber);
  }

  // END OF EXTRACTED FUNCTIONS
}

console.log(statement(invoices[0], plays));
