import { Calculator } from "@/components/calculators/Calculator";
export const metadata = {
  title: "Cash Flow Calculator | Revestor - Powered by Griffin Funding",
};
export default function Page() {
  return <Calculator kind="cashflow" />;
}
