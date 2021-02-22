# Advanced Scheduler

An advanced scheduler for weekly and monthly (comming) schedules with fixed time or solar (comming) events.

Currently with no well working Settings GUI. Change settings in examplesettings.json and paste it on the settings webpage. A better UI will come as soon as there is time for implementing it.

The idea is not having to setup LOTS of flows if you have complex rules of when to do things based on a weekly schedule (with possibly diffrent times at different days of week). The structure of the settings are:

Shedule Tokens Token 1 (describes a token (tag) with name and type) Token 2 Token ... ScheduleItems ScheduleItem 1 (describes 0 or more days to trigger and the time to trigger, time can also be solar events with offset in the future) TokenItems TokenItem 1 (refers to a token above and adds a value to set for the token when triggered. TokenItem is optional, if not set, the token will retain its value) TokenItem 2 TokenItem .. ScheduleItem 2 TokenItems TokenItem 1 TokenItem ..

The App triggers a flow when a ScheduleItem matches days and time. Before triggering the flow, the tokens that are configured have their values set according to TokenItem. This means that a logic expression can be used in the when card (Homeys built in Logic "app" can check for token values). That way you can have an argument for turning lights on or off for example, or to set a dim value. Or anything else that needs a value. The token values can be used in the When-part or in the Then-part.

This means you can setup a flow triggering on for exaple Mondays, Tuesdays, Thursdays, Fridays at 09:00, 11:00, 23:00 and 23:30, Wednesdays, Saturdays and Sundays at 10:00 and 23:00. At each of these triggering times you can set values for tokens (tags). Example values could be (tagname/value): (activate/true or false) (dimvalue/anything between 0 and 1). The resulting logic could then be set up as desired.

Todo:

Ask someone to do formal checks of code, as this is my first ever TypeScript/Javascript adventure. Review of code from a semantics perspective.

Create a task in VS Code that transpiles TS automatically and then does "homey app run".

Make sure debugging works.

Add error handling in relevant places.

Adding monthly shedule 

Adding solar events, based on suncalc (first version is implemented, testing needed)

Make sure the HTML GUI for editing settings is user friendly and looking nice



LOTS AND LOTS OF TESTING.