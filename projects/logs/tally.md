## Aug 15, 2026
This next iteration included magnets within the print and top support for the screen. I am approaching perfection with the switch feeling. 

![magnets](/assets/images/projects/tally/magnet.jpeg)
The unslapped side of the fulcrum lifts as it's slapped, but I feel like it doesn't lift enough. In addition to this, when holding the tally in your hand, you want to rest your thumb on something, and that ends up being this side of the fulcrum. However, due to the angle arc, you end up not allowing the switch to return after clicking. This can be solved by adjusting the angle.

Now to address the elephant in the room. The magnetic charger is a neat idea, but the placement right now requires a torque to be placed on the board in order to remove the cable. This is bad and feels bad.

It also looks really ugly, I know. I have had to look at it in every iteration. I'm probably going to buy a 90 deg adapter to place the charger at the rear, and then make a charging dock to prevent any bad torques.

<video src="/assets/images/projects/tally/magnet.mp4" controls playsinline muted loop></video>

## Aug 14, 2026
10:31 AM:
I bit the bullet and made the housing two pieces AND killed my darling limit switch placement. Both of these moves should have been done earlier. 

For some reason I thought that it was better to print a finger that would press the limit switch rather than pressing the limit switch with the printed switch (if that makes sense). 

I found with the last prototype that if the fulcrum was placed in the middle, it would ruin the slapping feel you get when slapping the switch from the screen side. So I moved the fulcrum back towards the screen, ergo enabling frontal slap and the new limit switch placement.

![Two Pieces and a new limit switch location](/assets/images/projects/tally/twoPiece.jpeg)
The two pieces come together with two screws and two meshing parts. One of the parts are not properly supported and break off. This will be fixed later. 

![Two Pieces V1](/assets/images/projects/tally/twoPieceLid.jpeg)
The lid/switch and the top bezel is too thin and the body is generally flimsy.

V2 12:42:
The second iteration increases the lid/switch width, adds support to reduce flimsiness (also reducing the need for a one of the screw tabs).

![Two Pieces V2](/assets/images/projects/tally/twoPieceV2.jpeg)
When fully assembled, the limit switch is always pressed and needs to be lowered.

V3 13:40:

IMAGES OF V3 ARE LOST

V3 lowered the limit switch, making it operable and attempted to help ease the meshing. The diameter of the top/switch is too small and does not need to hold onto the M2 screws inserted in it.

V4 21:36:

The diameter is fixed, the switch's width increased, and the meshing parts reinforced. This prototype allowed me to get a feel for the clicking behavior.

![Two Pieces V4](/assets/images/projects/tally/twoPieceV4.jpeg)
The switch was originally using the limit switch's spring to return the switch, but that felt very light. After consulting my mom on the feeling, I hot glued magnets.

![Two Pieces V4 Magnets](/assets/images/projects/tally/twoPieceV4Detail.jpeg)
The magnets worked better and we determined that the feeling of one magnet on one side and three on the other felt the best.

![Two Pieces V4 Side](/assets/images/projects/tally/TwoPieceV4Side.jpeg)
## July 20, 2026
I was folding some paper and realized that I could slide in the components without having to make too many visible screws. This kind of works, but I broke the screen trying to assemble this. My constraint now is assembly.
![Physical Prototype: Casing](/assets/images/projects/tally/physicalPrototypeComponentCase.jpeg)

## July 4, 2026
I went on a run and realised how a Wii remote also felt nice and had a good form factor. It doesn't feel right. I think that it will be hard/complicated to make the count satisfying and to assemble.
![Physical Prototype: Wii Remote](/assets/images/projects/tally/physicalPrototypeWiiStyle.jpeg)

## June 28, 2026
Trying to see how to make a paddle shifter style click. I like how paddle shifters feel and want to replicate the sensation
![Physical Prototype: Paddle Shifter](/assets/images/projects/tally/physicalPrototypePaddleShifter.jpeg)


## June 22, 2026

Parts arrived. Got all the code working. All through the one button: count, lock, reset. The font is Atkinson Hyperlegible by the Braille Institute
![Tally with RP2040 and e-ink display](/assets/images/projects/tally/helloTally.jpeg)
