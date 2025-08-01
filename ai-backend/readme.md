1. cd into ai-backend directory
2. run python -m venv venv
3. run source venv/bin/activate
4. run pip install -r requirements.txt
5. add necessary env variable in ai-backend/.env


parts :
part 1: ticket assignment
part 2: technician evaluation

api's:
1:
post: params(ticket element)
internal calls: GET technician details (call)
extract ticket description with llm
compare with technicians
reurn technician id

1:
phase 2: see all technician past work logs and figure out what exaclty he knows in each skill
        use this data to evalute his skills (initailly in percentage)
        also use this data to assign ticket
        and to evalute laerning potential
        if lerning potential present use that to increase his skill level

2:
POST: update skills () params(sla, worklog, feeback log)
this will evaluate the technicians involved in the ticket and return their updated skill levels

Evaluation parameters:

-> Ticket Resolution time(every task)
-> First contact resolution
-> Ticket re-open rate(percentage) which is reopened by user

LLM:
-> Adherence to SLA
-> Diagnostic approch
-> Solution quality
-> Sentiment analysis
