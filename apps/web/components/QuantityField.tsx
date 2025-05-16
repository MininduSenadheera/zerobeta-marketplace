import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function QuantityField(props: { quantity: number, setQuantity: CallableFunction }) {
  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="icon" onClick={() => props.setQuantity(props.quantity === 1 ? 1 : props.quantity - 1)}>
        <Minus />
      </Button>
      <Input type="number" value={props.quantity} readOnly className="[&::-webkit-inner-spin-button]:appearance-none text-center w-15" />
      <Button variant="ghost" size="icon" onClick={() => props.setQuantity(props.quantity + 1)}>
        <Plus />
      </Button>
    </div>
  )
}

export default QuantityField