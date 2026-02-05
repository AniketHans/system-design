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
2. When the ids for a DB table are fixed, suppose we have available ids for a URL shortner in the range `00000000 -> zzzzzzzz`. Then we can prepopulate the DB with nil entries and the possible ids. We can add data for a particular table id in future. This approach will help us in perform range partitioning in advance and also acquire locks for a row during a transaction more easily.
3. When we have multiple DBs having partitioned data and we want to store new data in one of the servers, so instead of manually routing to one of the servers, we can use managed services like CITUS. Citus has info about all the DB shards. It can help us in rebalancing the partitions and also, in case of accessing an record based on id, it redirects us to the correct server. Citus is a sharding extension to Postgres
4. For large immutable files with size >= 100KB, upload them directly to S3. Dont use server as the middleware/proxy
5. For retrieving static files, use CDNs. If the file is not present at CDN, it will act a proxy and bring the file for you.
6. Dont store very large texts in DB, it will increase the disk read time as more disk partitions need to be read to find the required data.
   1. It is also bad for replication as the process will become slow
   2. Write to cross zone DB will be expensive as large texts involve a lot of bandwidth to transfer
7. Opt for some Cron job to remove stale data from your system.
8. In case of cleanup for S3, use S3 lifecycle rules to cleanup
9. Data Processing for dashboards:
   1. You have 2 options:
      1. Store the contigous events in Db (cassandra) and then use a cron job to trigger Spark (data processing) to fetch the data periodically and process it and store it to some OLAP db like snowflake.
      2. Use kafka and flick to process the data and store it in OLAP db like snowflake
10. Realtime data processing/dashboards:
    1. If you have a lot of data comming regarding multiple entities in your system and you want to perform some kind of data enrichment, processing, aggregation, filtering, grouping, joining etc on the data in real time for particular entities, in this case go with Kafka streams. These support these kind on operations on continous stream of data thus very suitable for building real time dashboards with granularilty of say seconds to minutes to hours etc. Kafka streams perform the aggregation, filtering etc on the data and put it back to the message queue to be consumed by consumer
    2. If you want you can combine message queues with external stream processing frameworks like Apache flink. Kafka streams can be used if you are already using kafka message queue in the system otherwise you can go with message queue + stream processing(like flink) setup as well
       > Hence, for real time data processing, for say dashboards, aggregator queries etc, go with message queues(for handling the flow of events) + stream processing frameworks (to perform the aggregation, filtering, joining etc operations on the events) and store the processed result in some read heavy database so the results can be consumed by dashboards to show the real time data
11. Celebrity problem:
    1. It arises when you are writing to database regarding an entity, with some entity_id, and that entity has a lot of writes regarding it. This results in overwhelming the DB with writes.
    2. Even if you shard the db based on entity_ids still you can have a hot shard due to lot of writes comming to it.
    3. To prevent this, you can add random numbers to the entity_id (entity_id:0-N) and that will result in writing the data for entity on multiple shards. This way we can lower the load on a particular database/shard.
    4. But this will involve reading data from multiple shards to get the actual data regarding a particular entity
    5. Same can be done to distribute traffic in kafka partitions to save us from hot kafka partitions.
12. Scanning the a huge relations database:
    1. For scenarios where you have lots of many to many relations stored in a table, like we have Likes table with user_id and post_id indicating which user has a post, save your resources from scanning the whole table for counting these relations.
    2. Better go for CDC (change data capture). Publish all the relational events in message queue like kafka and have some consumers consume the events and store the calculated data in a separate no-sql db.
    3. With the help of CDC, you can prevent your self from scanning large tables to compute the desired output
13. Saving data to DB and also sending to Kafka message queue for further processing simultaneously:
    1. If app service wants to save some data in DB and simulateously send it to Kafka for further processing by consumers, better let CDC do this.
    2. You just write your changes to database. Database will create a replication log and let the CDC service like Debezium forward the changes to kafka queue.
    3. This saves us from 2 phase write problem where the application service is writing the same change to multiple places and if it fails at one place, this will result in inconsistencies in data
    4. If you want to write simultaneously to redis and db, better write to db and in case of cache miss, fetch data from the db and hydrate the cache
14. CDC:
    1. It can be done by using services like Debezium
    2. Debezium can look into the replication logs of a DB and add them to kafka queue
15. Fan out:
    1. When you have to put single data on multiple places, go for fan out arch.
    2. Like we are doing in news feed generation, single post_id need to go to feed of multiple users. Thus instead of fetching post_ids from multiple users multipple times and then sorting the posts by ids, its better to append each post to all the users by fanning out.
16. Use of NoSQL databases:
    1. Whenever you are thinking of using Redis because of storing data in say key-value format but the data is huge in size and important for further steps, better save it in No-Sql database like MongoDB like key value pair.
    2. These No-sql databases are persistent and can be a source for feeding data to the redis for fast retrievals
