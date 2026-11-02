/** Camera chapters, HTML cards and controls share these exact boundaries. */
export const JOURNEY_CUTS = [.24, .45, .635, .86] as const;
export const SECURITY_CARD_START = .461;
export const JOURNEY_STOPS = [
 ...Array.from({length:5}, (_,i)=>({start:.24+i*.21/5, at:.24+(i+.5)*.21/5, chapter:1, item:i})),
 ...Array.from({length:4}, (_,i)=>({start:i===0?.45:SECURITY_CARD_START+i*(.635-SECURITY_CARD_START)/4, at:SECURITY_CARD_START+(i+.5)*(.635-SECURITY_CARD_START)/4, chapter:2, item:i})),
 ...Array.from({length:3}, (_,i)=>({start:.635+i*(.86-.635)/3, at:[.67,.735,.805][i], chapter:3, item:i})),
 {start:.86, at:.925, chapter:4, item:0},
];
export function journeyStopAt(progress:number) {
 if(progress<.24)return -1;
 let index=0;for(let i=1;i<JOURNEY_STOPS.length;i++)if(progress>=JOURNEY_STOPS[i].start)index=i;
 return index;
}
export function journeyAt(progress:number) {
 const stop=journeyStopAt(progress), current=JOURNEY_STOPS[stop];
 return {stop,chapter:current?.chapter??0,item:current?.item??0,stage:["atrium","checkin","security","concourse","gate"][current?.chapter??0]};
}
