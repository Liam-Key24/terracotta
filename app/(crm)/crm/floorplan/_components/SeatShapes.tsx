import { NEUTRAL_SHAPE } from '../constants';

type SeatProps = {
    occupied: boolean;
    toneSeatClass?: string;
};

export function SeatSide({ occupied, toneSeatClass, flip }: SeatProps & { flip?: boolean }) {
    const shapeClass = occupied && toneSeatClass ? toneSeatClass : NEUTRAL_SHAPE;
    return (
        <div className={`flex items-center gap-2 ${flip ? 'flex-row-reverse' : ''}`} aria-hidden>
            <div className={`w-[1.08rem] h-[2.88rem] lg:w-[1.728rem] lg:h-[4.608rem] rounded-full ${shapeClass}`} />
            <div className={`w-1 h-[1.8rem] lg:w-[0.4rem] lg:h-[2.88rem] rounded-full ${shapeClass}`} />
        </div>
    );
}

export function SeatTop({ occupied, toneSeatClass }: SeatProps) {
    const shapeClass = occupied && toneSeatClass ? toneSeatClass : NEUTRAL_SHAPE;
    return (
        <div className="flex flex-col items-center gap-1" aria-hidden>
            <div className={`h-[1.44rem] w-[3.6rem] lg:h-[2.304rem] lg:w-[5.76rem] rounded-full ${shapeClass}`} />
            <div className={`h-[0.3rem] w-[2.88rem] lg:h-[0.48rem] lg:w-[4.608rem] rounded-full ${shapeClass}`} />
        </div>
    );
}

export function SeatBottom({ occupied, toneSeatClass }: SeatProps) {
    const shapeClass = occupied && toneSeatClass ? toneSeatClass : NEUTRAL_SHAPE;
    return (
        <div className="flex flex-col items-center gap-1" aria-hidden>
            <div className={`h-[0.3rem] w-[2.88rem] lg:h-[0.48rem] lg:w-[4.608rem] rounded-full ${shapeClass}`} />
            <div className={`h-[1.44rem] w-[3.6rem] lg:h-[2.304rem] lg:w-[5.76rem] rounded-full ${shapeClass}`} />
        </div>
    );
}
