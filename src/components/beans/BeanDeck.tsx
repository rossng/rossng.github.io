import BeanStatsCard from "./Bean";
import { beans } from "./BeanData";

export default function BeanDeck() {
  return (
    <div className="flex flex-wrap items-stretch">
      {beans.map((bean, idx) => (
        <div className="w-1/2 h-auto p-2 flex-shrink" key={idx}>
          <BeanStatsCard bean={bean} className="h-full" />
        </div>
      ))}
    </div>
  );
}
