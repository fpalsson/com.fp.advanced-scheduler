# Advanced Scheduler

An advanced scheduler for weekly and monthly (comming) schedules with fixed time or solar events (sunset, sunrise, dusk, dawn, midday and so on).

Currently with a Settings GUI that will be improved from a layout perspective and user friendlyness. 

The idea is not having to setup LOTS of flows if you have complex rules of when to do things based on a weekly schedule (with possibly diffrent times at different days of week). The structure of the settings are:

Scanarios and solutions
-----------------------
Scenario 1: Turn lamp or other on/off device on/off at regular times, in this scenario turn on at 19:00 and turn off at 07:00 every day.

Solution: 

Open app settings and then Advanced Scheduler. 

Create a new schedule, call it "Weekly night lights on" for example. 

Add a token of type boolean, call it "On". 

Add A new ScheduleItem. Edit it and set the time to 19:00. Click Close. Back at the main UI set the value to true. 

Repeat the process for a new ScheduleItem, but set the time to 07:00 and TokenItem value to false.

Now create a flow with trigger card Advanced Schedule. Select "Weekly night lights on" in the card.

Add a When-card of type "Logic is true/yes" (don't know the English translation). Browse for the token/tag called "Weekly night on - On".

Add a Then-card that does what you want when to turn the light on, and an Else-card to turn off.

This can all seem excessive, it could be accomplished with two simple flows, but the power of the app will be shown in the comming scenarios.


Scenario 2: Turn lamp or other on/off device on/off at solar triggered times (with offsets of desired), in this scenario turn on at sunset and turn off at sunrise every day.

Solution: 

Open app settings and then Advanced Scheduler. 

Expand the Schedule created in scenario 1. Click the edit button for both ScheduleItems, update trigger time to solar sunset/sunrise. Add offset if desired.

This can all seem excessive, it could be accomplished with two flows using the Sun Event app, but the power of the app will be shown in the comming scenarios.


Scenario 3: Turn lamp or other on/off device on/off at solar triggered times (with offsets of desired) and have it turned off during part of the night, in this scenario turn on 
at sunset and turn off at sunrise every day. Also have turned off between 23:00 and 05:00. 

Solution: 

Open app settings and then Advanced Scheduler. 

Expand the Schedule created in scenario 1 and 2. Add two new ScheduleItems. Set trigger time to 23:00 and 05:00 respectively. Set TokenItem value to false/true respectively.

This can all seem excessive, it could be accomplished with two flows using the Sun Event app, but the power of the app will be shown in the comming scenarios.


Scenario 4: Turn lamp or other on/off device on/off at regular times, different times for different days of week. 

Open app settings and then Advanced Scheduler. 

Create a new schedule, call it "Lights on during breakfast" for example. 

Add a token of type boolean, call it "On". 

Add A new ScheduleItem. Edit it and set the time to 06:00. Select weekdays (mo-fr) in the selection dropdown. Click Close. Back at the main UI set the value to true. 

Add A new ScheduleItem. Edit it and set the time to 07:00. Select weekdays (mo-fr) in the selection dropdown. Click Close. Back at the main UI set the value to false. 

Add A new ScheduleItem. Edit it and set the time to 09:00. Select weekends (sa, su) in the selection dropdown. Click Close. Back at the main UI set the value to true. 

Add A new ScheduleItem. Edit it and set the time to 10:00. Select weekends (sa, su) in the selection dropdown. Click Close. Back at the main UI set the value to false. 

Now create a flow with trigger card Advanced Schedule. Select "Lights on during breakfast" in the card.

Add a When-cards of type "Logic is true/yes" (don't know the English translation). Browse for the token/tag called "Lights on during breakfast - On".

Add one or more Then-card that does what you want when to turn the light on, and one or more Else-card to turn off.


Scenario 5, alternative 1: Turn lamp or other on/off device on/off at regular times AND dim dimmable device at the same time, different times for different days of week. 

Open app settings and then Advanced Scheduler. 

Open schedule created in scenario 4, 

Add a token of type number, call it "Dimval". 

For all ScheduleItems created in scenario 4, add TokenItem "Dimval" for all of them and set desired dim values (by now you should know how to do that)

Go back to flow created in scenario 4.

Add one or more Then-card for dimming lights, and one or more Else-card to dimming as well.

Call the flow for example "Lights on during breakfast".

The drawback of this is that you need two action cards for dimming as we have "Then/Else" logic.


Scenario 5, alternative 2: Turn lamp or other on/off device on/off at regular times AND dim dimmable device at the same time, different times for different days of week. 

Open app settings and then Advanced Scheduler. 

Open schedule created in scenario 4, 

Repeat alternative 1 until it is time for the flow partl

Now create a flow with trigger card Advanced Schedule. Select "Lights on during breakfast" in the card.

Call the flow for example "Lights dim during breakfast".

Add one or more Then-cards that dims devices. Select a token/tag as the value to dim to. 

The drawback of this is that you need an additional flow for dimabale devices, but you only need one action card in the flow, as opposed to two needed cards in alternative 1.


As you see, you can create VERY complex schedules easily with this app, without the need of complex flows.


Todo:

Ask someone to do formal checks of code, as this is my first ever TypeScript/Javascript adventure. Review of code from a semantics perspective. 

Create a task in VS Code that transpiles TS automatically and then does "npm run build" from settings-src folder and then "homey app run" from root folder

Make sure debugging works.

Add error handling in relevant places.

Refactor relevant parts and move some logic from Vue to websettings. Refactor websettings into containerclasses (possible namechange also), now that webpack makes modules with export usable.

Adding monthly shedule.

Adding solar events, based on suncalc (first version is implemented, testing needed).

Adding conditional ScheduleItems (trigger at sunrise if it is before/after fixed time)

Make sure the HTML GUI for editing settings is user friendly and looking nice. Today margins and similar is bananas! :-)

Input validation.

Making sure offsets that cross day limits from previous or following day are handeled.

LOTS AND LOTS OF TESTING.

Build (needs more work):
install needed stuff (npm install)
transpile TypeScript (tsc)
pack (cd settings-src, npm run build)
run (cd .., homey app run)
