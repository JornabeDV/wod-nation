import "dotenv/config";
import {
  PrismaClient,
  CompetitionStatus,
  ScoringType,
  Gender,
  DivisionType,
  PaymentStatus,
  RegistrationStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

async function main() {
  console.log("🧹 Cleaning existing data...");
  await db.score.deleteMany();
  await db.bracketMatch.deleteMany();
  await db.registration.deleteMany();
  await db.athlete.deleteMany();
  await db.wOD.deleteMany();
  await db.category.deleteMany();
  await db.competition.deleteMany();
  await db.organizerProfile.deleteMany();
  await db.verificationToken.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();

  console.log("🌱 Seeding database with massive dataset...");

  // ─── 1. Organizers ───
  const hashedPassword = await bcrypt.hash("demo123", 12);
  const organizers = await Promise.all(
    [
      { name: "Demo Organizer", email: "demo@wodnation.com", boxName: "CrossFit Mendoza", phone: "+54 9 261 555-5555" },
      { name: "Carla Romero", email: "carla@fitbox.com", boxName: "FitBox Córdoba", phone: "+54 9 351 666-7777" },
      { name: "Diego Fernández", email: "diego@crossba.com", boxName: "CrossFit Buenos Aires", phone: "+54 9 11 4444-3333" },
    ].map((o, i) =>
      db.user.create({
        data: {
          name: o.name,
          email: o.email,
          password: hashedPassword,
          role: i === 0 ? "ADMIN" : "USER",
          organizerProfile: {
            create: {
              boxName: o.boxName,
              phone: o.phone,
              bio: `Organizador profesional de competencias en ${o.boxName}.`,
              hasCompletedOnboarding: true,
            },
          },
          athlete: {
            create: {
              name: o.name,
              email: o.email,
              boxName: o.boxName,
            },
          },
        },
        include: { organizerProfile: true },
      })
    )
  );

  const orgProfiles = organizers.map((o) => o.organizerProfile!).filter(Boolean);

  // ─── 2. Competitions ───
  const compData = [
    {
      name: "Box Battle 2026",
      status: CompetitionStatus.PUBLISHED,
      start: new Date("2026-09-20T09:00:00"),
      end: new Date("2026-09-20T18:00:00"),
      deadline: new Date("2026-09-15T23:59:59"),
      fee: 15000,
      max: 80,
      organizerIdx: 0,
    },
    {
      name: "Summer Throwdown 2025",
      status: CompetitionStatus.LIVE,
      start: new Date("2025-01-10T08:00:00"),
      end: new Date("2025-01-12T20:00:00"),
      deadline: new Date("2025-01-05T23:59:59"),
      fee: 20000,
      max: 120,
      organizerIdx: 1,
    },
    {
      name: "Winter Games 2025",
      status: CompetitionStatus.FINISHED,
      start: new Date("2025-06-05T09:00:00"),
      end: new Date("2025-06-07T19:00:00"),
      deadline: new Date("2025-06-01T23:59:59"),
      fee: 0,
      max: 60,
      organizerIdx: 2,
    },
    {
      name: "Spring Open 2026",
      status: CompetitionStatus.DRAFT,
      start: new Date("2026-10-10T09:00:00"),
      end: new Date("2026-10-11T18:00:00"),
      deadline: new Date("2026-10-01T23:59:59"),
      fee: 10000,
      max: 50,
      organizerIdx: 0,
    },
    {
      name: "City Championship 2025",
      status: CompetitionStatus.PUBLISHED,
      start: new Date("2025-12-15T08:00:00"),
      end: new Date("2025-12-15T20:00:00"),
      deadline: new Date("2025-12-10T23:59:59"),
      fee: 25000,
      max: 100,
      organizerIdx: 1,
    },
  ];

  const competitions = await Promise.all(
    compData.map((c) =>
      db.competition.create({
        data: {
          name: c.name,
          slug: slugify(c.name),
          description: `La competencia ${c.name} reúne a los mejores atletas de la región para 2 días de intensidad pura.`,
          location: randomPick(["CrossFit Mendoza", "FitBox Córdoba", "CrossFit Buenos Aires", "Olimpo Training", "Iron Box Rosario"]),
          startDate: c.start,
          endDate: c.end,
          registrationDeadline: c.deadline,
          status: c.status,
          registrationFee: c.fee,
          currency: "ARS",
          maxAthletes: c.max,
          organizerId: orgProfiles[c.organizerIdx].id,
        },
      })
    )
  );

  // ─── 3. Categories ───
  const categoryDefs: Record<string, { name: string; gender?: Gender; division: DivisionType }[]> = {
    default: [
      { name: "RX Masculino", gender: Gender.MALE, division: DivisionType.RX },
      { name: "RX Femenino", gender: Gender.FEMALE, division: DivisionType.RX },
      { name: "Scaled Masculino", gender: Gender.MALE, division: DivisionType.SCALED },
      { name: "Scaled Femenino", gender: Gender.FEMALE, division: DivisionType.SCALED },
      { name: "Elite Masculino", gender: Gender.MALE, division: DivisionType.ELITE },
      { name: "Elite Femenino", gender: Gender.FEMALE, division: DivisionType.ELITE },
    ],
    masters: [
      { name: "Masters 35-39 M", gender: Gender.MALE, division: DivisionType.MASTER },
      { name: "Masters 35-39 F", gender: Gender.FEMALE, division: DivisionType.MASTER },
      { name: "Masters 40+ M", gender: Gender.MALE, division: DivisionType.MASTER },
      { name: "Masters 40+ F", gender: Gender.FEMALE, division: DivisionType.MASTER },
    ],
  };

  const categoriesByComp: Record<string, any[]> = {};

  for (const comp of competitions) {
    const defs =
      comp.name === "Winter Games 2025"
        ? [...categoryDefs.default, ...categoryDefs.masters]
        : categoryDefs.default;

    const cats = await Promise.all(
      defs.map((d, i) =>
        db.category.create({
          data: {
            competitionId: comp.id,
            name: d.name,
            gender: d.gender,
            divisionType: d.division,
            order: i + 1,
          },
        })
      )
    );
    categoriesByComp[comp.id] = cats;
  }

  // ─── 4. WODs ───
  const wodTemplates = [
    { name: "Fran", scoringType: ScoringType.FOR_TIME, timeCap: 10, desc: "21-15-9 Thrusters (43/30 kg) y Pull-ups" },
    { name: "Grace", scoringType: ScoringType.FOR_TIME, timeCap: 10, desc: "30 Clean & Jerks (61/43 kg)" },
    { name: "Cindy", scoringType: ScoringType.AMRAP, timeCap: 20, desc: "AMRAP 20 min: 5 Pull-ups, 10 Push-ups, 15 Air Squats" },
    { name: "Murph", scoringType: ScoringType.FOR_TIME, timeCap: 60, desc: "1 mile Run, 100 Pull-ups, 200 Push-ups, 300 Squats, 1 mile Run" },
    { name: "Max Snatch", scoringType: ScoringType.MAX_WEIGHT, timeCap: 6, desc: "1 rep max Squat Snatch en 6 minutos" },
    { name: "Max C&J", scoringType: ScoringType.MAX_WEIGHT, timeCap: 6, desc: "1 rep max Clean & Jerk en 6 minutos" },
    { name: "EMOM Burpees", scoringType: ScoringType.EMOM, timeCap: 12, desc: "EMOM 12 min: 10 Burpees over the bar" },
    { name: "Chipper", scoringType: ScoringType.FOR_TIME, timeCap: 25, desc: "50 Cal Row, 40 Box Jumps, 30 KBS, 20 TTB, 10 Muscle-ups" },
    { name: "Sprint", scoringType: ScoringType.FOR_TIME, timeCap: 5, desc: "100m Farmer Carry, 50 DU, 10 Wall Balls" },
    { name: "Points WOD", scoringType: ScoringType.POINTS, timeCap: 15, desc: "3 rounds de 5 ejercicios, cada uno suma puntos" },
  ];

  const wodsByComp: Record<string, any[]> = {};

  for (const comp of competitions) {
    const numWods = comp.name === "Spring Open 2026" ? 3 : comp.name === "Summer Throwdown 2025" ? 5 : 4;
    const selected = wodTemplates.slice(0, numWods);
    const wods = await Promise.all(
      selected.map((w, i) =>
        db.wOD.create({
          data: {
            competitionId: comp.id,
            name: `${w.name}`,
            description: w.desc,
            scoringType: w.scoringType,
            timeCapMinutes: w.timeCap,
            standards: "Estándares CrossFit oficiales. ROM completo en cada movimiento.",
            order: i + 1,
          },
        })
      )
    );
    wodsByComp[comp.id] = wods;
  }

  // ─── 5. Athletes & Registrations ───
  const maleNames = [
    "Martín García", "Lucas Pérez", "Carlos Ruiz", "Juan Torres", "Pedro Sánchez",
    "Santiago López", "Matías González", "Nicolás Fernández", "Agustín Rodríguez", "Tomás Martínez",
    "Franco Díaz", "Bruno Silva", "Ezequiel Romero", "Maximiliano Castro", "Leandro Acosta",
    "Gonzalo Herrera", "Facundo Vargas", "Mariano Ríos", "Cristian Morales", "Hernán Ortiz",
    "Damián Flores", "Federico Luna", "Iván Campos", "Julio Reyes", "Esteban Cruz",
    "Pablo Soto", "Andrés Vázquez", "Sebastián Navarro", "Diego Molina", "Ricardo Guerrero",
    "Alejandro Paredes", "Fernando Delgado", "Ramón Aguilar", "Miguel Peña", "Víctor Cabrera",
    "Joaquín León", "Luis Miranda", "Gabriel Rivas", "Emilio Figueroa", "Raúl Escobar",
  ];

  const femaleNames = [
    "Ana López", "María Silva", "Laura Díaz", "Carolina Ruiz", "Florencia Pérez",
    "Valentina González", "Camila Fernández", "Lucía Martínez", "Martina Rodríguez", "Sofía Torres",
    "Julieta Romero", "Agustina Castro", "Paula Acosta", "Mariana Herrera", "Daniela Vargas",
    "Victoria Ríos", "Natalia Morales", "Brenda Ortiz", "Milagros Flores", "Rocío Luna",
    "Abigail Campos", "Celeste Reyes", "Evelyn Cruz", "Araceli Soto", "Micaela Vázquez",
    "Yamila Navarro", "Morena Molina", "Antonella Guerrero", "Jimena Paredes", "Noelia Delgado",
    "Daiana Aguilar", "Romina Peña", "Gisela Cabrera", "Erica León", "Tamara Miranda",
    "Selena Rivas", "Ludmila Figueroa", "Magalí Escobar", "Candelaria Vega", "Abril Medina",
  ];

  const boxes = [
    "CrossFit Mendoza", "FitBox Córdoba", "CrossFit Buenos Aires", "Olimpo Training",
    "Iron Box Rosario", "CF Patagonia", "StrongBox La Plata", "Warrior Fitness",
    "Elite Training", "PowerHouse Gym", "The Forge", "Barbell Club",
  ];

  const athletesByComp: Record<string, Record<string, any[]>> = {};

  for (const comp of competitions) {
    athletesByComp[comp.id] = {};
    const cats = categoriesByComp[comp.id];

    for (const cat of cats) {
      const isMale = cat.gender === Gender.MALE;
      const isScaled = cat.divisionType === DivisionType.SCALED;
      const namePool = isMale ? maleNames : femaleNames;
      const numAthletes = isScaled ? randomInt(10, 16) : randomInt(12, 20);

      const shuffled = [...namePool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numAthletes);

      const athletes: any[] = [];
      for (const [idx, name] of selected.entries()) {
        const email = `${slugify(name)}-${idx}@box.com`;
        const athlete = await db.athlete.create({
          data: {
            name,
            email,
            gender: cat.gender ?? undefined,
            boxName: randomPick(boxes),
          },
        });

        const paymentStatus = randomPick([
          PaymentStatus.PAID,
          PaymentStatus.PAID,
          PaymentStatus.PAID,
          PaymentStatus.PENDING,
          PaymentStatus.FREE,
        ]);

        await db.registration.create({
          data: {
            competitionId: comp.id,
            categoryId: cat.id,
            athleteId: athlete.id,
            status: RegistrationStatus.CONFIRMED,
            paymentStatus,
            amountPaid: paymentStatus === PaymentStatus.PAID ? comp.registrationFee : paymentStatus === PaymentStatus.FREE ? 0 : undefined,
          },
        });

        athletes.push(athlete);
      }
      athletesByComp[comp.id][cat.id] = athletes;
    }
  }

  // ─── 6. Scores ───
  console.log("📝 Creating scores...");
  for (const comp of competitions) {
    const cats = categoriesByComp[comp.id];
    const wods = wodsByComp[comp.id];

    for (const cat of cats) {
      const athletes = athletesByComp[comp.id][cat.id];
      if (!athletes || athletes.length === 0) continue;

      for (const wod of wods) {
        // Generate plausible scores based on scoring type
        for (const athlete of athletes) {
          let rawScore = "";
          let value: number | null = null;

          if (wod.scoringType === ScoringType.FOR_TIME) {
            const cap = (wod.timeCapMinutes ?? 10) * 60;
            const seconds = randomInt(cap * 0.35, cap * 0.95);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            rawScore = `${mins}:${secs.toString().padStart(2, "0")}`;
            value = seconds;
          } else if (wod.scoringType === ScoringType.AMRAP) {
            const rounds = randomInt(8, 22);
            rawScore = `${rounds} rds`;
            value = rounds;
          } else if (wod.scoringType === ScoringType.MAX_WEIGHT) {
            const base = cat.gender === Gender.MALE ? 80 : 55;
            const weight = base + randomInt(-10, 40);
            rawScore = `${weight} kg`;
            value = weight;
          } else if (wod.scoringType === ScoringType.EMOM) {
            const reps = randomInt(8, 15);
            rawScore = `${reps} reps`;
            value = reps;
          } else if (wod.scoringType === ScoringType.POINTS) {
            const pts = randomInt(50, 150);
            rawScore = `${pts} pts`;
            value = pts;
          }

          await db.score.create({
            data: {
              competitionId: comp.id,
              wodId: wod.id,
              categoryId: cat.id,
              athleteId: athlete.id,
              rawScore,
              value,
              judgeName: randomPick(["Juez A", "Juez B", "Juez C", "Juez D"]),
              notes: randomPick(["", "", "Gran rendimiento", "Penalizado por no-rep", "PR personal"]),
            },
          });
        }
      }
    }
  }

  // ─── 7. Bracket Matches (for LIVE & FINISHED competitions) ───
  console.log("🏆 Creating brackets...");
  const bracketComps = competitions.filter(
    (c) => c.status === CompetitionStatus.LIVE || c.status === CompetitionStatus.FINISHED
  );

  for (const comp of bracketComps) {
    const cats = categoriesByComp[comp.id];
    const wods = wodsByComp[comp.id];

    for (const cat of cats) {
      const athletes = athletesByComp[comp.id][cat.id];
      if (!athletes || athletes.length < 4) continue;

      // Sort athletes by overall score to seed brackets
      // For simplicity, take top 8 (or 4 if less)
      const bracketSize = Math.min(8, Math.pow(2, Math.floor(Math.log2(athletes.length))));
      const bracketAthletes = athletes.slice(0, bracketSize);

      const rounds = Math.log2(bracketSize);
      const wodForBracket = randomPick(wods);

      for (let round = 1; round <= rounds; round++) {
        const matchesInRound = bracketSize / Math.pow(2, round);
        for (let pos = 0; pos < matchesInRound; pos++) {
          const athlete1 = round === 1 ? bracketAthletes[pos * 2] : undefined;
          const athlete2 = round === 1 ? bracketAthletes[pos * 2 + 1] : undefined;

          // For rounds > 1, athletes would come from previous winners. We'll leave them null for now
          // or pick random from bracket athletes for demo purposes.
          const a1 = athlete1?.id ?? randomPick(bracketAthletes).id;
          const a2 = athlete2?.id ?? randomPick(bracketAthletes).id;

          // Simulate winner
          const winnerId = randomPick([a1, a2]);

          await db.bracketMatch.create({
            data: {
              competitionId: comp.id,
              categoryId: cat.id,
              round,
              position: pos,
              athlete1Id: a1,
              athlete2Id: a2,
              winnerId: comp.status === CompetitionStatus.FINISHED ? winnerId : round === rounds ? winnerId : null,
              score1: randomPick(["2:45", "15 rds", "100 kg", "12 reps", "88 pts"]),
              score2: randomPick(["3:10", "14 rds", "95 kg", "10 reps", "82 pts"]),
              wodId: wodForBracket.id,
            },
          });
        }
      }
    }
  }

  // ─── Summary ───
  const counts = await Promise.all([
    db.user.count(),
    db.competition.count(),
    db.category.count(),
    db.wOD.count(),
    db.athlete.count(),
    db.registration.count(),
    db.score.count(),
    db.bracketMatch.count(),
  ]);

  console.log("\n✅ Seed completed successfully!");
  console.log(`   Users:        ${counts[0]}`);
  console.log(`   Competitions: ${counts[1]}`);
  console.log(`   Categories:   ${counts[2]}`);
  console.log(`   WODs:         ${counts[3]}`);
  console.log(`   Athletes:     ${counts[4]}`);
  console.log(`   Registrations:${counts[5]}`);
  console.log(`   Scores:       ${counts[6]}`);
  console.log(`   Brackets:     ${counts[7]}`);
  console.log("\n   Login: demo@wodnation.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
