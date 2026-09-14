# SafeNest

Protect. Understand. Act.

A Kenyan-first online-safety companion for parents, caregivers, and young people. SafeNest helps families understand a difficult online moment, preserve evidence, and take calm next steps — without surveillance, passwords, or AI accusations.

## What this MVP does

1. Someone reports that something happened online.
2. They upload a screenshot and/or describe it.
3. SafeNest analyses the content through a structured safety pipeline.
4. It returns a **risk type**, **severity**, **plain-language explanation**, and **action plan**.
5. Evidence is stored in a locker the family controls.
6. Verified Kenyan resources are matched from a curated database — never invented by the model.

## Screens

1. Welcome  
2. Choose role  
3. Register / login  
4. Parent dashboard  
5. Child dashboard  
6. Report incident  
7. Upload evidence  
8. AI safety analysis  
9. Action plan  
10. Evidence locker  
11. Trusted resources  
12. Child linking

## Run locally

You need Node 20+.

```bash
# API
cd api
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Web (second terminal)
cd web
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Demo accounts after seed:

- Parent: `amani@safenest.ke` / `Safeguard123`
- Child: `kito@safenest.ke` / `Safeguard123`

Set `OPENAI_API_KEY` in `api/.env` to use a vision model. Without a key, SafeNest still runs using the on-device safety classifier so the demo never blocks on an API.

## Principles

- Data minimisation
- No social-media passwords
- No hidden surveillance
- Users can delete incidents and evidence
- AI identifies indicators, not guilt
- Human help is recommended for urgent cases
- Resource phone numbers come only from the verified database
