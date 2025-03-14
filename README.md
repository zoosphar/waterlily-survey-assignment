## ADDTIONAL NOTES
### TRADE OFFS
- Used file based sqllite db instead of cloud hosted relational db, because for this assignment and also for small projects like forms, sqllite can be a great choice offering light-weight db with all the power of a sql based relational db.
- Made a client rendered React app instead of a Next.js app, Next.js is a great choice for building and nowadays a defacto for building React applications, I used plain simple React + Vite setup because the form app is only a single page application and won't involve complex routing, caching, and server side rendering which next has to offer for a more complex or large scale project.
- Using bun compiler instead of node for server side typescript code, because bun offers built in tooling and support for almost all the node features and it has been proven to perform better than node in benchmarks, because it's a drop in replacement we're not losing any of our node functionalies but gaining a lot more from this modern take on the server side js runtime.

### DESIGN CHOICES
- To keep the concerns seperated I made different server and client apps, having a seperate server as a service will let us scale it without worrying about the client side load and it can be further integrated as a micro service with other services, for example authentication service or analytics service.
- For frontend components I used shadcn because it gives really nice and sleek UI with the advantage of extending it and customizing it according to preference.
- In the database I created 4 tables forms, qusetions, options, and questionResponses. This normalizes the db and will make the db less and less coupled and not one table has to manage eveything.

### FUTURE IMPROVEMENTS
- I would be implementing a email and password based authentication to map the responses to a particular user and after successful submission send them a copy of their responses on the mail.
- On the UI side having, single question at a time, form validations, and progress indicators could be great ways to enhance user experience.
- Having more than 2 types of fields for user to answer question like, dropdown, checkboxes, short text, long text, file uploads, and range sliders.
- binding the keyboard shortcuts with the form and adding accessibility html attributes like ARIA to make the form accessible for old and disabled people.
