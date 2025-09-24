# For Later
Move photo storage to s3 bucket

Add Google login as well as magic link login, and do we want email password too? Can we enforce only good secure logins like magic link?

Add more test coverage

Make tests more complete

Make the graphql calls neater, maybe they exist in their own files/folders

We lost the database again


# New notes

Home 
- I'm not really sure what to do with the homepage for now.

Search
- The select date popover appears too far down the page, not right next to the select date trigger
- The search field and the submit field are two different heights - are we using standardized components for each of these?
- The Map under the map tab should take up even more vertical space
- When searching, there is a big flash of loading skeletons which look jarring. Either we need a loading animation, or preferrably just don't show the new results until they have finished loading, or stream them.
