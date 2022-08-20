# WARNING: rmb to change firebase & web3auth to moonlight when testing for dev
testsetest ui

### Notes:
=> firebase preview deploy: firebase hosting:channel:deploy <preview_name> --expires 1d

=> firebase offical deploy option 1 (from preview - clone): firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

- SOURCE_SITE_ID and TARGET_SITE_ID: These are the IDs of the Hosting sites that contain the channels.
-- For your default Hosting site, use your Firebase project ID.
-- You can specify sites that are in the same Firebase project or even in different Firebase projects.

- SOURCE_CHANNEL_ID: This is the identifer for the channel that is currently serving the version you want to deploy to your live channel.
-- For a live channel, use live as the channel ID.

EXAMPLE: firebase hosting:clone livethree-d1d85:SOURCE_CHANNEL_ID livethree-d1d85:live

=> firebase offical deploy option 2 (from local): firebase deploy --only hosting

ref: https://firebase.google.com/docs/hosting/multisites?authuser=0&hl=en#set_up_deploy_targets

-----------

preview template: firebase hosting:channel:deploy <preview-name> --only <site-id> --expires 1d
preview example : firebase hosting:channel:deploy test1 --only livethree-landing-page --expires 1d

deploy template: firebase deploy --only hosting:<site-id>
deploy example: firebase deploy --only hosting:livethree-landing-page

firebase hosting:channel:deploy vite1 --only livethree-d1d85 --expires 1d
------------

localhost will run .env.development secrets [yarn start]
production will run .env.production secrets [yarn run build]
ref: https://stackoverflow.com/questions/42458434/how-to-set-build-env-variables-when-running-create-react-app-build-script#:~:text=npm%20start%20will%20set%20REACT_APP_NODE_ENV,env.



### Before close beta

- connect wallet



 ---- BUGGY ----
- sometimes just failed to load:
GET https://broadcast-server.tor.us/store/get?key=04d34af91b22f5e49a5ecf308da2df80d4b85a209e54622d25f77d061bad174ffa0dd4de3d004a8cb134da87458c03d95be32f3fe56fc76e035e6250cf8b522b10 404


test
### during closed beta
- upgrade Alchemy so dont hit limit
- upgrade 100ms so dont hit limit
- upgrade Web3Auth so dont hit limit

- apply SF grant
- apply polygon grant
- apply 100ms grant?

- change { isDebugger && <Debugger /> } into  <Debugger2 />

### Enhancements - must haves
- do testing driven development when rework the livethree app | https://www.youtube.com/watch?v=04BBgg8zgWo&ab_channel=LaithAcademy | https://www.youtube.com/results?search_query=react+testing
- make if suddenly network(chain) for some reason, pending call or active call is cleared properly
- FORGOT PASSWORD at sign in page
- CallsPage.tsx history uses OLD data, how to sync in map?
- do a "in the works"/"coming soon" features such as screen share / live streaming 
- proper receipt (how much spent) in historic calls
- todo reduce cost, can we get useDocument data from useCollection? (Call.tsx using both, manybe can only use one)
- FIRESTORE RULES - history - see TODO in Could Firestore Tab's Rules Tab
- prettify auth verification & password reset WEBSITE
- handle blocked popup (if got any case)
- enforce app check for firestore, storage, cloud function | https://www.youtube.com/watch?v=DEV372Kof0g
- screen share
- interactive live streaming
- proper typescript
- vite (instead of CRA - create-react-app): https://vitejs.dev/ (vs Next.js?)
- best practices for firebase Auth & Firestore (ignore the class instead of hooks): https://www.youtube.com/watch?v=knk5Fjrpde0&ab_channel=Firebase
- use-react-forms + mui: https://react-hook-form.com/  ||  https://github.com/dohomi/react-hook-form-mui
- use react-query for firebase stuff and others, one down side of the current react-firebase-hooks is that cannot control the state of error and cost
- make can delete active stream as recipient as well (not only sender - current)
- handle cookies, apparently LiveThree uses cookies unknowingly (more than just from web3auth)

- use server-side listener to listen when peer exit room, then trigger end [CFA money stream, delete firebase firestore & delete 100ms room (if need)]
(listen to what to initate end trigger?: 100ms's webhook? how to implement this?) ref: https://www.100ms.live/docs/server-side/v2/foundation/webhook
ref:
we don't have any short term plans for this(and it's quite difficult to do it in generic way, there are a lot of web server frameworks), but I can defintiely point you in the right direction.
Webhooks are only about setting up an api server, if you want to go with Python the easiest way to do this is using Flask. Here is a simple blog demonstrating this - https://www.realpythonproject.com/intro-to-webhooks-with-and-how-to-receive-them-with-python/
For just seeing how the webhooks responses will look like you can use this site - https://webhook.site/ to get a webhook url and put in dashboard's developer section, the UI will then show all the incoming webhooks.
Possible to webhooks for SPAs? to consider revamp version of app.livethree.xyz | OR | if say use Next.js part server style and deploy to hosting, auto have a server to "listen"?

resources for webhook to close money stream:
1. webhooks 101: https://www.youtube.com/watch?v=41NOoEz3Tzc&ab_channel=freeCodeCamp.org | https://github.com/TwilioDevEd/webhooks-course/blob/main/code/express-discorder/server.js
2. webhooks in firebase cloud fn: https://firebase.google.com/docs/functions
3. use reason: https://www.100ms.live/docs/server-side/v2/foundation/webhook#peer-leave-success
(for 3.) how to distinguish between normal "end call" vs "non-explicit end call" such as window closed / pc shutdown, also, prevent double deleteFlow fn call. - ANS: use peer.leave.success unexpected reason (must test): https://www.100ms.live/docs/server-side/v2/foundation/webhook#peer-leave-success

- logo guide: https://logosbynick.com/logo-files-for-clients/

### Enhancements - good to consider
- better user search functionality (eg search by username) -- in Favourites Page
- missed calls section? - expensive in db
- list of active flows. use subgraph or db
- if hms room or money stream suddenly ends, end the call, execute
-- primary - client side
-- secondary - server side (backup)
- on/off -ramp service
- sign up - terms of service, write the service (maybe need add scroll functionality)
- translation to USD (from DAIx or USDCx)
- captcha for sign in / sign up (before upload pic)
// https://www.npmjs.com/package/react-google-recaptcha
// https://levelup.gitconnected.com/how-to-implement-recaptcha-in-a-react-application-6098c506d750

- LiveThree doesn't use cookkies: https://softwareengineering.stackexchange.com/a/295212

require register
https://www.google.com/recaptcha/admin/create

## all test cases for video call
 
 Pre-call
 - change tabs and press chrome's back button
 - refresh/exit from caller side
 - pending call - end from caller side
 - pending call - end from callee side
 - wait expire pending
 
 Normal-call-end (active call end using end icon)
- caller side
- callee side
- wait expire active **

 Unexpected-end
 --- active call, from callee side ---
 - close tab
 - close window
 - refresh
 - press back
  --- active call, from caller side ---
  - close tab
  - close window
  - refresh
  - press back

------ cannot reliably delete flow for cases below, make a "do not leave this page" warning ------

  --- after accept call, before video load, after tx send, from callee side --- *** 
   - close tab
 - close window
 - refresh
 - press back 
  ---  after accept call, before video load, after tx send, from caller side --- ***
  - close tab
  - close window
  - refresh
  - press back
  --- after accept call, before video load, b4 tx send, from callee side --- ***
   - close tab
 - close window
 - refresh
 - press back 
  ---  after accept call, before video load, b4 tx send, from caller side --- ***
  - close tab
  - close window
  - refresh
  - press back