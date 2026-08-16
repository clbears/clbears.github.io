## Aug 12, 2026
Lots of work done today. I met with my friend and we determined that we are going to use a autonomy stack that doesn't require good teleop.

I went back to the xbox controller method. The controls are based off of an excavator (and is working really well)

We also created a test setup:
![Test Setup](/assets/images/projects/robotArm/setup.jpeg)

![Webcam View](/assets/images/projects/robotArm/webcamview.jpeg)

I also created a safety layer that blocks the robot from folding in on itself, going into the table, and going too high.

## Aug 7, 2026
I gave up on the controller and tried to use webcam-based hand tracking using mediapipe. I'm still trying to convert the end effector into cartesian, and then moving that way. The issue with this approach is that the Z estimation is based on the size of my hand and there is no way to determine pitch.

## Aug 3, 2026
Getting this thing to move is a challenge! We don't have a leader arm, so we need a reliable way to control it and we need to train ourselves to control it. Currently debugging a way of controlling it via an xbox series x controller.

## Aug 1, 2026
Everything is assembled.
![Robot's First Photo](/assets/images/projects/robotArm/firstPhoto.jpeg)

## July 23, 2026
Most of the parts are printed. I used PETG instead of the recommended PLA because that was the only color I had in white and I wanted the robot to be in white. We decided to use SmolVLA as our model. Everything else is undetermined.

## July 29, 2026
Today I started on a Physical AI project with my friend. The arm will be based on [SO-100](https://huggingface.co/docs/lerobot/so100). We are currently working on determining our goals and the best autonomy stack to achieve them.

The build guide recommended to print a lego tolerance test before a long 11hr print. Legos' tolerances are so cool.
![Lego test fit](/assets/images/projects/robotArm/legoTestFit.jpeg)