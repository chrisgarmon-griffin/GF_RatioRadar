import { Calculator } from "@/components/calculators/Calculator";
export const metadata = {
  title: "Cash Flow Calculator | Griffin Funding RatioRadar",
};
export default function Page() {
  return <Calculator kind="cashflow" />;
}
