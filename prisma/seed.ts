import "dotenv/config";
import { PrismaClient, CompetitionStatus, ScoringType, Gender, DivisionType, PaymentStatus, RegistrationStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create organizer user
  const hashedPassword = await bcrypt.hash("demo123", 12);
  const user = await db.user.create({
    data: {
      name: "Demo Organizer",
      email: "demo@wodnation.com",
      password: hashedPassword,
      role: "ORGANIZER",
    },
  });

  const profile = await db.organizerProfile.create({
    data: {
      userId: user.id,
      boxName: "CrossFit Mendoza",
      phone: "+54 9 261 555-5555",
    },
  });

  // 2. Create competition
  const competition = await db.competition.create({
    data: {
      name: "Box Battle 2026",
      slug: "box-battle-2026",
      description: "La competencia más grande de la región. 3 WODs épicos para definir al atleta más completo.",
      location: "CrossFit Mendoza, Av. San Martín 1234",
      startDate: new Date("2026-03-15T09:00:00"),
      endDate: new Date("2026-03-15T18:00:00"),
      registrationDeadline: new Date("2026-03-10T23:59:59"),
      status: CompetitionStatus.PUBLISHED,
      registrationFee: 15000, // $150 ARS
      currency: "ARS",
      maxAthletes: 50,
      organizerId: profile.id,
    },
  });

  // 3. Create categories
  await db.category.createMany({
    data: [
      { competitionId: competition.id, name: "RX Masculino", gender: Gender.MALE, divisionType: DivisionType.RX, order: 1 },
      { competitionId: competition.id, name: "RX Femenino", gender: Gender.FEMALE, divisionType: DivisionType.RX, order: 2 },
      { competitionId: competition.id, name: "Scaled Masculino", gender: Gender.MALE, divisionType: DivisionType.SCALED, order: 3 },
      { competitionId: competition.id, name: "Scaled Femenino", gender: Gender.FEMALE, divisionType: DivisionType.SCALED, order: 4 },
    ],
  });

  const cats = await db.category.findMany({ where: { competitionId: competition.id } });
  const rxM = cats.find((c) => c.name === "RX Masculino")!;
  const rxF = cats.find((c) => c.name === "RX Femenino")!;
  const scM = cats.find((c) => c.name === "Scaled Masculino")!;
  const scF = cats.find((c) => c.name === "Scaled Femenino")!;

  // 4. Create WODs
  const wod1 = await db.wOD.create({
    data: {
      competitionId: competition.id,
      name: "WOD 1: Fran",
      description: "21-15-9 reps of Thrusters (43/30 kg) and Pull-ups",
      scoringType: ScoringType.FOR_TIME,
      timeCapMinutes: 10,
      standards: "Thrusters: codo por debajo de la rodilla en el fondo, codo extendido arriba. Pull-ups: mentón por encima de la barra.",
      order: 1,
    },
  });

  const wod2 = await db.wOD.create({
    data: {
      competitionId: competition.id,
      name: "WOD 2: Cindy",
      description: "AMRAP 20 min: 5 Pull-ups, 10 Push-ups, 15 Air Squats",
      scoringType: ScoringType.AMRAP,
      timeCapMinutes: 20,
      standards: "Push-ups: pecho al suelo. Squats: cadera por debajo de la rodilla.",
      order: 2,
    },
  });

  const wod3 = await db.wOD.create({
    data: {
      competitionId: competition.id,
      name: "WOD 3: Max Clean & Jerk",
      description: "1 rep max Clean & Jerk in 6 minutes",
      scoringType: ScoringType.MAX_WEIGHT,
      timeCapMinutes: 6,
      standards: "El bar debe pasar por overhead con brazos extendidos y codo/rodilla/hips en línea.",
      order: 3,
    },
  });

  // 5. Create athletes
  const athletesData = [
    { name: "Martín García", email: "martin@box.com", gender: Gender.MALE, boxName: "CrossFit Centro", categoryId: rxM.id },
    { name: "Lucas Pérez", email: "lucas@box.com", gender: Gender.MALE, boxName: "CrossFit Norte", categoryId: rxM.id },
    { name: "Carlos Ruiz", email: "carlos@box.com", gender: Gender.MALE, boxName: "CrossFit Este", categoryId: rxM.id },
    { name: "Ana López", email: "ana@box.com", gender: Gender.FEMALE, boxName: "CrossFit Centro", categoryId: rxF.id },
    { name: "María Silva", email: "maria@box.com", gender: Gender.FEMALE, boxName: "CrossFit Sur", categoryId: rxF.id },
    { name: "Laura Díaz", email: "laura@box.com", gender: Gender.FEMALE, boxName: "CrossFit Oeste", categoryId: rxF.id },
    { name: "Pedro Sánchez", email: "pedro@box.com", gender: Gender.MALE, boxName: "CrossFit Local", categoryId: scM.id },
    { name: "Juan Torres", email: "juan@box.com", gender: Gender.MALE, boxName: "CrossFit Norte", categoryId: scM.id },
  ];

  for (const a of athletesData) {
    const athlete = await db.athlete.create({
      data: {
        name: a.name,
        email: a.email,
        gender: a.gender,
        boxName: a.boxName,
      },
    });

    await db.registration.create({
      data: {
        competitionId: competition.id,
        categoryId: a.categoryId,
        athleteId: athlete.id,
        status: RegistrationStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        amountPaid: 15000,
      },
    });
  }

  const athletes = await db.athlete.findMany({
    where: { registrations: { some: { competitionId: competition.id } } },
    include: { registrations: true },
  });

  const getAthlete = (name: string) => athletes.find((a) => a.name === name)!;

  // 6. Create scores
  const scores = [
    // RX Masculino - Fran (For Time - lower is better, stored as seconds)
    { athlete: "Martín García", wod: wod1.id, cat: rxM.id, raw: "2:45", val: 165 },
    { athlete: "Lucas Pérez", wod: wod1.id, cat: rxM.id, raw: "3:12", val: 192 },
    { athlete: "Carlos Ruiz", wod: wod1.id, cat: rxM.id, raw: "3:58", val: 238 },

    // RX Masculino - Cindy (AMRAP - higher is better)
    { athlete: "Martín García", wod: wod2.id, cat: rxM.id, raw: "18 rds", val: 18 },
    { athlete: "Lucas Pérez", wod: wod2.id, cat: rxM.id, raw: "16 rds", val: 16 },
    { athlete: "Carlos Ruiz", wod: wod2.id, cat: rxM.id, raw: "14 rds", val: 14 },

    // RX Masculino - Max C&J (Max Weight - higher is better)
    { athlete: "Martín García", wod: wod3.id, cat: rxM.id, raw: "115 kg", val: 115 },
    { athlete: "Lucas Pérez", wod: wod3.id, cat: rxM.id, raw: "102 kg", val: 102 },
    { athlete: "Carlos Ruiz", wod: wod3.id, cat: rxM.id, raw: "95 kg", val: 95 },

    // RX Femenino - Fran
    { athlete: "Ana López", wod: wod1.id, cat: rxF.id, raw: "3:22", val: 202 },
    { athlete: "María Silva", wod: wod1.id, cat: rxF.id, raw: "4:05", val: 245 },
    { athlete: "Laura Díaz", wod: wod1.id, cat: rxF.id, raw: "4:48", val: 288 },

    // RX Femenino - Cindy
    { athlete: "Ana López", wod: wod2.id, cat: rxF.id, raw: "15 rds", val: 15 },
    { athlete: "María Silva", wod: wod2.id, cat: rxF.id, raw: "13 rds", val: 13 },
    { athlete: "Laura Díaz", wod: wod2.id, cat: rxF.id, raw: "11 rds", val: 11 },

    // RX Femenino - Max C&J
    { athlete: "Ana López", wod: wod3.id, cat: rxF.id, raw: "78 kg", val: 78 },
    { athlete: "María Silva", wod: wod3.id, cat: rxF.id, raw: "72 kg", val: 72 },
    { athlete: "Laura Díaz", wod: wod3.id, cat: rxF.id, raw: "65 kg", val: 65 },
  ];

  for (const s of scores) {
    const athlete = getAthlete(s.athlete);
    await db.score.create({
      data: {
        competitionId: competition.id,
        wodId: s.wod,
        categoryId: s.cat,
        athleteId: athlete.id,
        rawScore: s.raw,
        value: s.val,
      },
    });
  }

  console.log("✅ Seed completed!");
  console.log("   User: demo@wodnation.com / demo123");
  console.log("   Competition: /competitions/box-battle-2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
