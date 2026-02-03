# System Design Strategies

What to do when interviewer asks you, "Design XYZ system"?

- Note: We will be taking example of URL shortner here

### STEP 1 : Gather the Functional Requirements:

1. You need not know about the system, you might have not heard about the system. It's ok.
2. You can say in a way, like,
   > Lets say we are the ones making this system for the first time, what's the function of this system
3. Ask interviewer:
   1. **What the system is supposed to do? OR, What's the main function of this system?**
      - You: What does this URL shortner do? (unaware of the service)
      - Interviewer will explain you about the service. Try to note it down
   2. **What are the core functionalities needed in the system? Write them down**
      - List down the functionalities needed for the system
      - 2 way communicate with the interviewer for the these. If some requirement is not clear and seems the interviewer and you might be looking in different directions, ask him to move to the whiteboard and try to draw the flow roughly so to you both come on the same page. The visual aids will help you in landing at some common ground and saves a lot of time
      - This might include some core functionalities as well as some provision for monitoring as well.

### STEP 2 : Gather the Non-Functional requirements

1. You can ask for some non functional requirements like:
   1. **Number of Daily Active Users**
      1. This can be used to determine the possible services, that the users interacts the most, and whether we need to scale them individually or not?
   2. **Number of writes in a day?**
      1. This can be useful in determining the type of database to be used, whether we should use a write heavy database?
      2. What type of setup like single leader, multi-leader (leads to inconsistency) to be used based on the write throughput and geogoraphical location of users?
      3. In some cases, we can encounter celebrity problem due to distribution of data in different shards based on some wrong partition id. We need to redistribute the data amoung the shards based on some better partition keys
      4. Sometimes, we have to introduce msg queue to handle the bulk/batch writes
   3. **Number of reads in a day?**
      1. This can also we used to determine:
         1. The type of database, SQL/Nosql, read heavy
         2. Whether need to introduce cache?
         3. Whether we should introduce partitioning and sharding to fasten the data access and retrieval process
   4. **Latency of the resposne**
      1. If the response is required immediatley then we might have to apply some cache for fast data retreival
      2. If the response can be send async through some email, sms or notification etc, we can use msg queue for better processing of the data
      3. If the low latency is required in the write phase, then some eventual consistent database (like cassandra) can be used here
      4. May be the low latency of response is needed on some functionality of the system, mention that functionality
   5. **CAP Theorem**, what is needed and where in the system
      1. If you are using a monolith, then CAP theorem is not required to discuss but if you are a Distributed setup, CAP theorem is a must
      2. We can have either Consistency or Availability.
      3. If consistency is chosen, then:
         1. In case of DB connection failure, you should not send data from cache as that can be stale. The whole system will stop working
         2. In case of any write operation, you cannot read data from any replica until all the replicas get the latest write
      4. If availability is chosen, then:
         1. We are agreeing on sending stale data to the user for some time means caches (read through way) can be used.
      5. This can happen that some functionalities of the system need high consistency and some need high availability

### STEP 3 : Write down the core entities of the system

1. Now, after gathering the functional and non functional requirements, we need to identify the core entities of the system.
2. Identifying the core entities means:-
   1. The elements around which the system is being created like in case of url shortner, we have short_url, long_urls
   2. The entities which will be interacting with the system, could be a user, another service etc
3. These entities will help us in:
   1. Creating apis, like:
      1. what data we need from external sources,
      2. what data will be created in the system using the external sources
      3. What data will be traded between multiple services
      4. What data will be expected as output
   2. Knowing data structure as well,
      1. We can sometimes know what data to persist in which format

### STEP 4: Mention the APIs needed

1. APIs in system design round can be created using the functional requirements
2. For each functional requirement with which the user interacts directly, by asking or sharing some info, create an api for it
3. Mention the entities that will be exchanged in them

### STEP 5: Create HLD

1. After mentioning the Apis, ask the interviewer to move to the HLD part. Use some kind of visual aid software like excalidraw to create this HLD. The HLD will help you and your interviewer know the flow and land on a common ground for the flow
2. Pre mention with the interviewer that, for now you are only focussing on the basic flow in HLD. For any discussion regarding, which tech to use, scaling of the system etc, will be discussed in Deep Dive section. Just ask him to correct, if you have understood the basic requirements and basic flow of the system fine.
3. HLD should have enough flow to meet the Functional requirements of the system
4. **Do not mention any specific software technology names, instead use generalized names**:
   1. Redis --> Cache
   2. Kafka --> Message Queue
   3. Database --> Persistent Storage / Database
   4. MySQl --> SQL DB
   5. MongoDB --> No SQL Database
   6. EC2 instances --> Cloudservers
   7. Lambda server --> Serverless
5. **Do not get into any arugment regarding a specific technology, nitty gritty details of a flow during the HLD with the interviewer. Postpone that discussion for the deep dive part.**
6. If you get into any argument like why you have used cache here, any persistent storage should be right. Ask him to complete the flow first and and in the deep dive part, we will dig deep into what cound be the solution

### STEP 6: Deep Dive

## Important scenarios and use of tech:

1. Cache vs Persistent Storage:
   1. Whenever you want to storage some data, question arises where to store it.
      1. Caches are fast and easy to access (easy in implementing and code integration) but are volatile. A restart will delete all the data. Caches are tried to be kept near the users locations
      2. Databases are bit slower and slightly difficult to implement as compared to caches (in development, we need to take care of transactions, ORM etc) but store data permanently. Databases can be separated apart from the users
   2. If there is some data which will be used in multiple flows of you system and loss of which will hamper the flows in system, try to keep it in persistent stores
