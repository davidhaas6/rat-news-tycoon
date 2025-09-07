import type { FunctionComponent } from "react";
import type { Writer } from "../types/writer";
import { motion } from "motion/react";

interface NewsDeskProps {
  writer: Writer
}

const NewsDesk: FunctionComponent<NewsDeskProps> = (props: NewsDeskProps) => {
  return (
    <motion.div 
    drag
    dragConstraints={{ left: 5, right: 5, top: 5, bottom: 5 }}
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9, opacity: 0.8, }}
    whileDrag={{boxShadow: 1}}
  key={"news-desk-" + props.writer.id}
  className="size-50 m-5 p-2 rounded text-amber-200 bg-[url('/image/rat-keyboard-anim.gif')] bg-cover bg-center text-center font-bold"
>
  {props.writer.name}
</motion.div>

  );
}

export default NewsDesk;