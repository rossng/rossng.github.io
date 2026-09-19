import BeanStatsCard from "./Bean";
import { beans } from "./BeanData";

export default function BeanDeck() {
  return (
    <div className="bean-deck">
      {beans.map((bean, idx) => (
        <BeanStatsCard bean={bean} key={idx} />
      ))}
    </div>
  );
}
