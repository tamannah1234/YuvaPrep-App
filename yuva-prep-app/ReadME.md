# Work flow
 [*]Login=>redirect home page(start session btn)
 [*]Startsession btn => /form(candidate enters JD)=>/Interview(mic and text space Questions start)
 [*]Response send =>Backend(call model wisper + bert)(Post request send with resume) =>frontend 
 [*]Feedback Generate (/summary)=>db store feedback of the users


# Login
User enters name + email.
Backend sends OTP to email (/api/auth/send-otp).
User enters OTP → verify via /api/auth/verify-otp.
On success, you:
Store JWT token + user info in localStorage.
Redirect to /home.

# Resume
[*]The file itself goes into /uploads/ ( Multer).
[*]The DB only stores the path/filename, so your table stays lightweight and you don’t bloat the DB with binary files.

# Done
Home Page: Dynamic hero section and cards.
User Check: Displays different buttons if logged in or not.
Start Session: Logged-in users can start interview prep; others are redirected to login.
Cards: Include Start Interview, Previous Sessions, and Daily Challenge

# Questions Fetching
/Interview(mic and text space Questions start)
 [*]Response send =>Backend(call model wisper + bert)(Post request send with resume) =>frontend 
 [*]Feedback Generate (/summary)=>db store feedback of the users
 [Done]
 [Questionsdb]Fetch display on /Interview[Random-Left]

 [Pending]
 Model connection[Feedback] [summary-left]
 [Mic/Text]Response Record
 
# Functionality
[*]Mic 🎤 → records audio → Whisper → transcript → BERT feedback.
[*]Text ⌨️ (or Enter) → directly → BERT feedback.
[*]You don’t need to click Send, Enter will work.

# Modal environment activate
[*] .\venv\Scripts\activate
[*]uvicorn app:app --reload --port 8000


# Pending Improvement
[1]Feedback -->Summary
[2]Random Questions Generation =>Resume Analyze
[3]IDE Integration =>Analysis feedback
[4]Developer input any similar input can take and provide questions
[5]Voice Based Question Reader

# Questions Improvement(Modification)
Q:What is the useEffect hook in React, and when would you use it?
Ans:What is the useEffect hook in React, and when would you use it?
Feedback → Score: 100, Keywords: 100%




========================================================
Task need to complete are as follows
========================================================
1) Profile (http://localhost:5173/profile) data must be store in DB based on that Skills, project (techstack), experience
  * used to Generate Mock Interviews
  * have optuons to put JD Experience Tech stack 
2) Home Page will explain our project in cards form
  * Banner, Features, About us, Footer 
3) Flow of the project ==> clicked start session ==>http://localhost:5173/form  
* (Collects custom session information(Desired Role, Experience, (select as per JD metion is for frehser, junior,mid,    senior)),JD/Skills add)
* Collects profile data interest =>start session for interview
4) http://localhost:5173/interview   this is interview rooms where each person can independently start meetings and question answer session occur simuntaneouly so that after competing the teast redierect to further route
5) Route http://localhost:5173/summary    where average score of an individual Display
* Dashboard : It includes this
  * Previous Sessions
  * Performance Metrics
  * Daily Challenges
  * Suggestions
6) Performance Metrics : This is btn  where Each session Average score will be visible and history data will be stored in Previous Sessions btn 
 