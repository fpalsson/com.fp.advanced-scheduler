# Advanced Scheduler main help page
 
[German version](/com.fp.advanced-scheduler/index.de.html)
 
## The purpose of the app

There are a few main ideas that gave life to this app:
* To easily be able to schedule things that should happen in your Homey system. 
* To avoid having MANY different flows with different times as triggers just because you want something happen to several times every day.
* To avoid having even more or unnecessarily complex flows if you want different behaviour on different days of the week.
* Having a uniform way to setup scheduled events no matter if it is based on fixed time or solar events.

## Overall function of the app
In the app you setup rules of when different things shall happen. 

The meaning of "when" in this context is two things. When to trigger flows, and to change values of tags.

The meaning of "different things" in this context is: what should happen in the flows. This is controlled by how the flows are setup AND the values of the tags mentioned in the row above this.  

## Structure of settings

Below is an overview of the structure of a schedule as defined in the app. The app can contain many schedules.


```    
Schedule
     |
     |- Contains tag definitions (zero or more)
     | 
     -- Contains schedule events (zero or more)
             |
             -- Contains tags with values to be set (zero or more from tag definitions above)
```

So a schedule can contain tag definitions (more on that topic soon) and schedule events. Each schedule event represents a time in the schedule. This time can be fixed or based on solar events (sunset, sunrise and so on). A schedule event also has info on what day of the week it is active. That can be everyting from zero days (which doesn't really make sense) to all seven days per week in every combination you want.

The tag definitions in the schedule is simply a way to communicate with the "outside world" and make it possible to control flows. You define tags with a type (boolean, numeric or string) and give them a meaningful name.

After setting up tag definitions in the schedule, they can be added in the schedule events. When a schedule event is created all the tags defined in that schedule is automagically added to the schedule event. For every tag in the schedule event you set a value. This value (or these values if multiple tags are used) will be set by the app when the schedule event triggers.

## Details on schedule events

A schedule can trigger based on a fixed time or solar events. Apart from this it is possible to make additions and exceptions to the triggers. 

### Random trigger time

If you specify a random time, the app will set a triggering time between the main trigger and the random time. The random time can be a fixed time or a solar event.

### First or last 

When using a solar event the triggering time varies depending on the time of year. If you for example want to turn on a lamp at sunset, but not later than 21:00 then you setup the schedule event to trigger at the first of sunset and 21:00. The same can be used but triggering the last of two times.

### Only trigger if before and/or after

When using a solar event the triggering time varies depending on the time of year. If you for example want to turn on a lamp at sunset, but not if later than 21:00 then you setup the schedule event to trigger at sunset but only if before 21:00. 

### Combination of triggers and conditions

The possibilities described above can be combined as desired. Please note that some combinations will result in the schedule event never triggering. Consider for example triggering at sunrise but not before 21:00. This will not happen in many places of the world :-)

## Scenarios and examples
### Scenario 1
**Turn lamp or other on/off device on or off at regular times, in this scenario turn on at 19:00 and turn off at 07:00 every day.**

Solution: 
1. Create a new schedule, call it "Weekly night lights on" for example. 
1. Add a **tag** of type boolean to **tag definitions**, call it "On". 
1. Add A new **schedule event**. Edit it and set the time to 19:00. Click Close.
1. Set **tag value** to true. 
1. Repeat the process for a new **schedule event**, but set the time to 07:00 and the tag value to false.
1. Create a flow with "when card" Advanced Scheduler -> Schedule triggered. Select "Weekly night lights on" in the card.
1. Add an if-card of type "Logic is true/yes" (unsure about the English translation). Browse for the tag/tag called "Weekly night on - On".
1. Add a Then-card that does what you want to turn the light on, and an Else-card to turn off.

_This can all seem excessive, it could be accomplished with two simple flows, but the power of the app will be shown in the comming scenarios._

### Scenario 2
**Turn lamp or other on/off device on or off at solar triggered times (with offsets if desired), in this scenario turn on at sunset and turn off at sunrise every day.**

Solution: 
1. Expand the **schedule** created in scenario 1 above. 
1. Click the edit button for both **schedule events**.
1. Update the time to type **solar** and select **sunset/sunrise** respectively. Add offset if desired.

_This can all seem excessive, it could be accomplished with two flows using the Sun Event app, but the power of the app will be shown in the comming scenarios._

### Scenario 3 
**Turn lamp or other on/off device on or off at solar triggered times (with offsets if desired) and have it turned off during part of the night, in this scenario turn on at sunset and turn off at sunrise every day. Also have turned off between 23:00 and 05:00.**

Solution: 
1. Expand the **schedule** created in scenario 1 and 2. 
1. Add two new **schedule events**. 
1. Set **trigger time** to 23:00 and 05:00 respectively. 
1. Set the **tag** On value to false/true respectively.

_This could be accomplished with two more flows (for a total of four flows) and times to trigger, so the power of the app is starting to show._

### Scenario 4
**Turn lamp or other on/off device on or off at regular times, different times for different days of week.**

Solution:
1. Create a new schedule, call it "Lights on during breakfast" for example. 
1. Define a tag of type boolean, call it "On". 
1. Add A new schedule event. Edit it and set the time to 06:00. Select weekdays (Mo-Fr) in the selection dropdown. Click Close. 
1. Set the tag value to true. 
1. Add A new schedule event. Edit it and set the time to 07:00. Select weekdays (Mo-Fr) in the selection dropdown. Click Close. 
1. Set the tag value to false. 
1. Add A new schedule event. Edit it and set the time to 09:00. Select weekends (Sa, Su) in the selection dropdown. Click Close. 
1. Set the tag value to true. 
1. Add A new Schedule event. Edit it and set the time to 10:00. Select weekends (Sa, Su) in the selection dropdown. Click Close. 
1. Set the tag value to false. 
1. Create a flow with trigger card Advanced Scheduler -> Schedule triggered. Select "Lights on during breakfast" in the card.
1. Add a If-cards of type "Logic is true/yes" (unsure about the English translation). Browse for the tag called "Lights on during breakfast - On".
1. Add one or more Then-cards that does what you want when to turn the light on, and one or more Else-cards to turn off.

### Scenario 5, alternative 1
**Turn lamp or other on/off device on or off at regular times AND dim dimmable device at the same time, different times for different days of week.**

Solution:
1. Open schedule created in scenario 4
1. Add a new tag definition of type number, call it "Dimval". 
1. For all schedule events created in scenario 4, add tag "Dimval" and set desired dim values (by now you should know how to do that).
1. Go back to flow created in scenario 4.
1. Add one or more Then-card for dimming lights, and one or more Else-card to dimming as well. Use the tag **Lights on during breakfast - DimVal** as an argument in the cards.

_The drawback of this is that you need two action cards for dimming as we have "Then/Else" logic._

### Scenario 5, alternative 2
**Turn lamp or other on/off device on or off at regular times AND dim dimmable device at the same time, different times for different days of week.**

Solution:
1. Open schedule created in scenario 4
1. Do steps in alternative 1 until it is time for the flow part.
1. Now create a new flow with trigger card Advanced Scheduler -> Schedule triggered. Select "Lights on during breakfast" in the card.
1. Call the flow for example "Lights dim during breakfast".
1. Add one or more Then-cards that dims devices. Select the tag **Lights on during breakfast - DimVal** as an argument to the card. 
_The drawback of this is that you need an additional flow for dimable devices, but you only need one action card in the flow, as opposed to two needed cards in alternative 1._

**As you see, you can create VERY complex schedules easily with this app, without the need of complex flows.**

## Details

It is totally possible to have tags defined in a schedule that are not used in the schedule events. The tag values for a specific tag will only be changed if there is a tag added to that schedule event. Perhaps you only want to change a specific tag value in some of the events. In that case simply removed the tags in question with the trashcan button.

## Solar events described with a picture

![](./SunEvents.png)
