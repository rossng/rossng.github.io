import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@assets/components/ui/tooltip";
import type { Bean } from "./BeanData";
import { Button } from "@assets/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@assets/components/ui/card";

export interface BeanStatsCardProps {
  bean: Bean;
}

const BeanStatsCard = ({ bean }: BeanStatsCardProps) => {
  return (
    <Card className="w-96">
      <CardHeader>
        <div className="flex justify-center items-center mb-4">
          <div className="relative w-24 h-24">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute inset-0 w-5/6 h-5/6 rounded-full flex items-center justify-center z-10 hover:ring-2 hover:ring-black hover:drop-shadow-md ${
                      bean.appearances[0].cotyledonColour === false
                        ? "bg-white"
                        : ""
                    } m-auto`}
                    style={{
                      backgroundColor:
                        bean.appearances[0].cotyledonColour || undefined,
                    }}
                  >
                    {bean.appearances[0].cotyledonColour === false && (
                      <span className="text-gray-500 text-2xl font-bold">
                        ?
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Cotyledon</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute inset-0 bg-brown-600 rounded-full border-8 hover:ring-2 hover:ring-black hover:drop-shadow-md"
                    style={{
                      borderColor:
                        bean.appearances[0].seedCoatColour || undefined,
                      borderStyle: !bean.appearances[0].seedCoatColour
                        ? "dashed"
                        : "solid",
                    }}
                  ></div>
                </TooltipTrigger>
                <TooltipContent>Seed coat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardTitle className="text-center">
          {bean.commonNames[0]}{" "}
          <span className="text-gray-600">({bean.primaryScientificName})</span>
        </CardTitle>
        <CardDescription>
          <div className="flex flex-row">
            <div className="flex-grow text-center text-gray-500">
              {bean.commonIncorrectNames.slice(1).join(", ")}
            </div>
            <div className="flex-grow text-center text-gray-400">
              {bean.otherScientificNames.join(", ")}
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
};

export default BeanStatsCard;
