using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Ovutor.Common.Sdk.Security;
using Ovutor.Common.Sdk.WebsiteContent;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Persistence;

namespace Ovutor.Postgres.Sdk.Seed;

/// <summary>Idempotent — only runs when the Clients table is empty, so it's safe to call on every
/// startup. Ports the fixtures the frontend used to hardcode as mocks, so the app isn't empty on
/// first run against a fresh database.</summary>
public static class DbSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    /// <summary>Npgsql requires DateTime.Kind == Utc for "timestamp with time zone" columns;
    /// DateTime.Parse alone produces Kind=Unspecified, which Npgsql rejects outright.</summary>
    private static DateTime Utc(string value) => DateTime.SpecifyKind(DateTime.Parse(value), DateTimeKind.Utc);

    public static async Task SeedAsync(OvutorDbContext db)
    {
        if (await db.Clients.AnyAsync()) return;

        db.AdminUsers.Add(new AdminUser
        {
            Name = "Maya",
            Email = "maya@northstarplanning.com",
            PasswordHash = PasswordHasher.Hash("Password123!"),
            Role = "Lead Planner",
        });

        var categories = new[] { "Contracts", "Vendor", "Timeline", "Venue", "Internal" };
        foreach (var name in categories) db.DocumentCategories.Add(new DocumentCategory { Name = name });

        var sofia = BuildClient("sofia-daniel", "Sofia & Daniel", "Sofia Reyes", "Daniel Brooks", "2026-09-03",
            "The Foundry · Brooklyn", 96, "attention", 88, 52000, 47800, "USD", "Confirm final catering count", "SD",
            "sofia.reyes@example.com", "Foundry!219");

        var olivia = BuildClient("olivia-noah", "Olivia Bennett & Noah Carter", "Olivia Bennett", "Noah Carter", "2026-12-14",
            "The Glasshouse · New York", 140, "on-track", 64, 68000, 41200, "USD", "Finalize floral design", "ON",
            "olivia.bennett@example.com", "Glasshouse!482");

        var isla = BuildClient("isla-benjamin", "Isla & Benjamin", "Isla Whitfield", "Benjamin Cole", "2026-11-22",
            "Wildflower Estate", 120, "attention", 71, 74000, 39500, "GBP", "£1,690 over target", "IB",
            "isla.whitfield@example.com", "Wildflower!637");

        var amelia = BuildClient("amelia-james", "Amelia & James", "Amelia Foster", "James Whitaker", "2027-04-17",
            "The River House", 80, "early-planning", 14, 41000, 4200, "USD", "Review vendor shortlist", "AJ",
            "amelia.foster@example.com", "RiverHouse!058");

        var charlotte = BuildClient("charlotte-henry", "Charlotte & Henry", "Charlotte Pierce", "Henry Ashford", "2026-10-11",
            "Meadowlark Barn · Hudson Valley", 110, "on-track", 55, 59000, 28000, "EUR", "Payment reconciliation", "CH",
            "charlotte.pierce@example.com", "Meadowlark!304");

        var mayaEthan = BuildClient("maya-ethan", "Maya & Ethan", "Maya Alvarez", "Ethan Park", "2027-08-02",
            "Cliffside Terrace · Big Sur", 60, "early-planning", 8, 38000, 0, "USD", "Book venue walkthrough", "ME",
            "maya.alvarez@example.com", "Cliffside!921");

        var clients = new[] { sofia, olivia, isla, amelia, charlotte, mayaEthan };
        db.Clients.AddRange(clients);

        SeedSofiaDetail(db, sofia);
        SeedOliviaDetail(db, olivia);
        SeedIslaDetail(db, isla);
        SeedAmeliaDetail(db, amelia);
        SeedCharlotteDetail(db, charlotte);
        SeedMayaEthanDetail(db, mayaEthan);

        foreach (var client in clients) SeedWebsiteSections(db, client);
        SeedWebsiteContent(db, sofia, isSofia: true);
        SeedWebsiteContent(db, olivia, isSofia: false, heroFilledIn: true);
        foreach (var c in new[] { isla, amelia, charlotte, mayaEthan }) SeedWebsiteContent(db, c, isSofia: false);

        await db.SaveChangesAsync();
    }

    private static Client BuildClient(string slug, string coupleNames, string partnerA, string partnerB, string weddingDate,
        string venue, int guestCount, string status, int planningPercent, decimal budgetTotal, decimal budgetPaid,
        string currency, string nextAttention, string avatarInitials, string portalEmail, string portalPassword) => new()
    {
        Slug = slug,
        CoupleNames = coupleNames,
        PartnerA = partnerA,
        PartnerB = partnerB,
        WeddingDate = DateOnly.Parse(weddingDate),
        Venue = venue,
        GuestCount = guestCount,
        Status = status,
        PlanningPercent = planningPercent,
        BudgetTotal = budgetTotal,
        BudgetPaid = budgetPaid,
        Currency = currency,
        NextAttention = nextAttention,
        AvatarInitials = avatarInitials,
        PortalEmail = portalEmail,
        PortalPasswordHash = PasswordHasher.Hash(portalPassword),
    };

    private static void SeedSofiaDetail(OvutorDbContext db, Client client)
    {
        var phases = new[]
        {
            new ChecklistPhase { ClientId = client.Id, Title = "I. Set the foundation", Order = 1 },
            new ChecklistPhase { ClientId = client.Id, Title = "II. Secure your team", Order = 2 },
            new ChecklistPhase { ClientId = client.Id, Title = "III. Shape the celebration", Order = 3 },
            new ChecklistPhase { ClientId = client.Id, Title = "IV. Finalize the details", Order = 4 },
        };
        db.ChecklistPhases.AddRange(phases);

        db.ChecklistTasks.AddRange(
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Set your shared wedding budget", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Build your first guest count", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Choose a wedding date", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Book ceremony venue", Status = "done" },
            new ChecklistTask
            {
                ClientId = client.Id, PhaseId = phases[1].Id, Title = "Confirm final catering count", Status = "open",
                DueDate = DateOnly.Parse("2026-08-10"), Priority = "at-risk",
                Note = "2 days overdue — headcount needed before deposits are finalized.",
            },
            new ChecklistTask
            {
                ClientId = client.Id, PhaseId = phases[1].Id, Title = "Confirm photographer contract", Status = "open",
                DueDate = DateOnly.Parse("2026-08-13"), Priority = "at-risk",
                Note = "Contract received. Deposit payment still outstanding.",
            },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[2].Id, Title = "Send save-the-dates", Status = "open", DueDate = DateOnly.Parse("2026-08-20"), Priority = "due-soon" },
            new ChecklistTask
            {
                ClientId = client.Id, PhaseId = phases[2].Id, Title = "Choose wedding party attire", Status = "blocked",
                DueDate = DateOnly.Parse("2026-08-22"), Priority = "waiting", Note = "Waiting on two responses before ordering.",
            },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[2].Id, Title = "Finalize floral design", Status = "open", DueDate = DateOnly.Parse("2026-08-28") },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[3].Id, Title = "Confirm final seating chart", Status = "open", DueDate = DateOnly.Parse("2026-09-01") },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[3].Id, Title = "Rehearsal dinner logistics", Status = "open", DueDate = DateOnly.Parse("2026-09-02") }
        );

        var venueCat = new BudgetCategory { ClientId = client.Id, Name = "Venue & rentals" };
        var cateringCat = new BudgetCategory { ClientId = client.Id, Name = "Catering & bar" };
        var photoCat = new BudgetCategory { ClientId = client.Id, Name = "Photography & video" };
        var floralCat = new BudgetCategory { ClientId = client.Id, Name = "Florals & decor" };
        db.BudgetCategories.AddRange(venueCat, cateringCat, photoCat, floralCat);

        db.BudgetExpenses.AddRange(
            new BudgetExpense { CategoryId = venueCat.Id, Vendor = "The Foundry venue hire", Description = "Deposit paid, balance due before the day.", Planned = 12000, Agreed = 11800, Paid = 6000, NextDue = DateOnly.Parse("2026-08-20") },
            new BudgetExpense { CategoryId = venueCat.Id, Vendor = "Ceremony setup & furniture", Planned = 1800, Agreed = 1800, Paid = 1800 },
            new BudgetExpense { CategoryId = cateringCat.Id, Vendor = "Plated dinner, 96 guests", Planned = 14400, Agreed = 13920, Paid = 6960, NextDue = DateOnly.Parse("2026-08-25") },
            new BudgetExpense { CategoryId = cateringCat.Id, Vendor = "Open bar package", Planned = 5200, Agreed = 5200, Paid = 2600, NextDue = DateOnly.Parse("2026-08-25") },
            new BudgetExpense { CategoryId = photoCat.Id, Vendor = "Studio North — full day", Planned = 6200, Agreed = 6200, Paid = 1550, NextDue = DateOnly.Parse("2026-08-13") },
            new BudgetExpense { CategoryId = floralCat.Id, Vendor = "Bloom & Bramble", Planned = 4800, Agreed = 4600, Paid = 2300 }
        );

        db.RsvpGuests.AddRange(
            new RsvpGuest { ClientId = client.Id, Household = "Daniel Brooks", Status = "attending", AttendanceCount = 1, Dietary = "None", RespondedAtUtc = Utc("2026-07-28") },
            new RsvpGuest { ClientId = client.Id, Household = "The Alvarez Family", Status = "attending", AttendanceCount = 4, Dietary = "1 gluten-free", RespondedAtUtc = Utc("2026-07-20") },
            new RsvpGuest { ClientId = client.Id, Household = "Priya & Sam Osei", Status = "declined", RespondedAtUtc = Utc("2026-07-15"), PlannerNote = "Sent regrets, will send a gift." },
            new RsvpGuest { ClientId = client.Id, Household = "Grace Lin", Status = "awaiting" },
            new RsvpGuest { ClientId = client.Id, Household = "The Whitfield Family", Status = "awaiting" },
            new RsvpGuest { ClientId = client.Id, Household = "Marcus & Elena Torres", Status = "attending", AttendanceCount = 2, Dietary = "Nut allergy — Elena", RespondedAtUtc = Utc("2026-07-30"), PlannerNote = "Flag nut allergy with caterer." }
        );

        db.DocumentFiles.AddRange(
            new DocumentFile { ClientId = client.Id, Name = "Foundry venue contract.pdf", Uploader = "Maya (planner)", Visibility = "client", Category = "Contracts", SizeLabel = "1.2 MB", UploadedAtUtc = Utc("2026-06-02") },
            new DocumentFile { ClientId = client.Id, Name = "Catering proposal — final.pdf", Uploader = "Maya (planner)", Visibility = "client", Category = "Vendor", SizeLabel = "860 KB", UploadedAtUtc = Utc("2026-07-11") },
            new DocumentFile { ClientId = client.Id, Name = "Day-of timeline draft.docx", Uploader = "Sofia Reyes", Visibility = "client", Category = "Timeline", SizeLabel = "45 KB", UploadedAtUtc = Utc("2026-07-22") },
            new DocumentFile { ClientId = client.Id, Name = "Internal vendor notes.pdf", Uploader = "Maya (planner)", Visibility = "planner-only", Category = "Internal", SizeLabel = "210 KB", UploadedAtUtc = Utc("2026-07-25") }
        );

        db.ActivityEvents.AddRange(
            new ActivityEvent { ClientId = client.Id, Message = "Daniel Brooks RSVP'd attending for Sofia & Daniel.", TimestampUtc = Utc("2026-08-12T08:30:00Z") },
            new ActivityEvent { ClientId = client.Id, Message = "Uploaded Catering proposal — final.pdf.", TimestampUtc = Utc("2026-08-11T13:40:00Z") }
        );

        db.Milestones.AddRange(
            new MilestoneItem { ClientId = client.Id, Title = "Confirm final catering count", DueDate = DateOnly.Parse("2026-08-10"), Tag = "Overdue" },
            new MilestoneItem { ClientId = client.Id, Title = "Confirm photographer contract", DueDate = DateOnly.Parse("2026-08-13"), Tag = "At risk" }
        );
    }

    private static void SeedOliviaDetail(OvutorDbContext db, Client client)
    {
        var phases = new[]
        {
            new ChecklistPhase { ClientId = client.Id, Title = "I. Set the foundation", Order = 1 },
            new ChecklistPhase { ClientId = client.Id, Title = "II. Secure your team", Order = 2 },
            new ChecklistPhase { ClientId = client.Id, Title = "III. Shape the celebration", Order = 3 },
            new ChecklistPhase { ClientId = client.Id, Title = "IV. Finalize the details", Order = 4 },
        };
        db.ChecklistPhases.AddRange(phases);

        db.ChecklistTasks.AddRange(
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Set your shared wedding budget", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Choose a wedding date", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Book ceremony venue", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Book reception venue", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Finalize floral design", Status = "open", DueDate = DateOnly.Parse("2026-08-15"), Priority = "due-soon" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[2].Id, Title = "Send save-the-dates", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[2].Id, Title = "Menu selection", Status = "open", DueDate = DateOnly.Parse("2026-08-18"), Priority = "due-soon", Note = "Due this week." },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[3].Id, Title = "Finalize guest list", Status = "blocked", Priority = "waiting" }
        );

        var venueCat = new BudgetCategory { ClientId = client.Id, Name = "Venue & rentals" };
        var floralCat = new BudgetCategory { ClientId = client.Id, Name = "Florals & decor" };
        db.BudgetCategories.AddRange(venueCat, floralCat);
        db.BudgetExpenses.AddRange(
            new BudgetExpense { CategoryId = venueCat.Id, Vendor = "The Glasshouse venue hire", Planned = 18000, Agreed = 18000, Paid = 9000, NextDue = DateOnly.Parse("2026-09-01") },
            new BudgetExpense { CategoryId = floralCat.Id, Vendor = "Wild Bloom Studio", Planned = 7200, Agreed = 7000, Paid = 3500 }
        );

        db.RsvpGuests.AddRange(
            new RsvpGuest { ClientId = client.Id, Household = "Noah Carter's parents", Status = "attending", AttendanceCount = 2, RespondedAtUtc = Utc("2026-07-10") },
            new RsvpGuest { ClientId = client.Id, Household = "The Bennett Family", Status = "attending", AttendanceCount = 5, RespondedAtUtc = Utc("2026-07-12") },
            new RsvpGuest { ClientId = client.Id, Household = "James Carver", Status = "awaiting" },
            new RsvpGuest { ClientId = client.Id, Household = "Ana & Tom Reyes", Status = "declined", RespondedAtUtc = Utc("2026-07-18") }
        );

        db.DocumentFiles.AddRange(
            new DocumentFile { ClientId = client.Id, Name = "Glasshouse floor plan.pdf", Uploader = "Maya (planner)", Visibility = "client", Category = "Venue", SizeLabel = "3.1 MB", UploadedAtUtc = Utc("2026-05-18") },
            new DocumentFile { ClientId = client.Id, Name = "Florist mood board.pdf", Uploader = "Wild Bloom Studio", Visibility = "client", Category = "Vendor", SizeLabel = "5.4 MB", UploadedAtUtc = Utc("2026-07-02") }
        );

        db.ActivityEvents.AddRange(
            new ActivityEvent { ClientId = client.Id, Message = "You updated Catering actuals for Olivia & Noah.", TimestampUtc = Utc("2026-08-12T09:15:00Z") },
            new ActivityEvent { ClientId = client.Id, Message = "Published Hero and Our Story sections to the wedding website.", TimestampUtc = Utc("2026-08-10T15:22:00Z") }
        );

        db.Milestones.AddRange(
            new MilestoneItem { ClientId = client.Id, Title = "Finalize floral design", DueDate = DateOnly.Parse("2026-08-15"), Tag = "Due soon" },
            new MilestoneItem { ClientId = client.Id, Title = "Menu selection", DueDate = DateOnly.Parse("2026-08-18"), Tag = "Due soon" },
            new MilestoneItem { ClientId = client.Id, Title = "RSVP deadline", DueDate = DateOnly.Parse("2026-08-24"), Tag = "RSVP" }
        );
    }

    private static void SeedIslaDetail(OvutorDbContext db, Client client)
    {
        var phases = new[]
        {
            new ChecklistPhase { ClientId = client.Id, Title = "I. Set the foundation", Order = 1 },
            new ChecklistPhase { ClientId = client.Id, Title = "II. Secure your team", Order = 2 },
            new ChecklistPhase { ClientId = client.Id, Title = "III. Shape the celebration", Order = 3 },
            new ChecklistPhase { ClientId = client.Id, Title = "IV. Finalize the details", Order = 4 },
        };
        db.ChecklistPhases.AddRange(phases);
        db.ChecklistTasks.AddRange(
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Set your shared wedding budget", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Book ceremony venue", Status = "done" },
            new ChecklistTask
            {
                ClientId = client.Id, PhaseId = phases[1].Id, Title = "Reconcile florals & entertainment budget", Status = "open",
                DueDate = DateOnly.Parse("2026-08-16"), Priority = "at-risk", Note = "Category is £1,690 over target.",
            },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[2].Id, Title = "Choose wedding party attire", Status = "open", DueDate = DateOnly.Parse("2026-08-24") }
        );

        var cat = new BudgetCategory { ClientId = client.Id, Name = "Florals & entertainment", Description = "Over target — reconcile with the couple before the next payment." };
        db.BudgetCategories.Add(cat);
        db.BudgetExpenses.AddRange(
            new BudgetExpense { CategoryId = cat.Id, Vendor = "Wildflower Estate florals", Planned = 8000, Agreed = 9200, Paid = 4600, NextDue = DateOnly.Parse("2026-08-30") },
            new BudgetExpense { CategoryId = cat.Id, Vendor = "Live band — 5 piece", Planned = 4200, Agreed = 4940, Paid = 2470 }
        );

        db.ActivityEvents.Add(new ActivityEvent { ClientId = client.Id, Message = "Budget category Florals & entertainment exceeded target.", TimestampUtc = Utc("2026-08-11T17:05:00Z") });
    }

    private static void SeedAmeliaDetail(OvutorDbContext db, Client client)
    {
        var phases = new[]
        {
            new ChecklistPhase { ClientId = client.Id, Title = "I. Set the foundation", Order = 1 },
            new ChecklistPhase { ClientId = client.Id, Title = "II. Secure your team", Order = 2 },
            new ChecklistPhase { ClientId = client.Id, Title = "III. Shape the celebration", Order = 3 },
            new ChecklistPhase { ClientId = client.Id, Title = "IV. Finalize the details", Order = 4 },
        };
        db.ChecklistPhases.AddRange(phases);
        db.ChecklistTasks.AddRange(
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Set your shared wedding budget", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Review vendor shortlist", Status = "open", DueDate = DateOnly.Parse("2026-08-14"), Priority = "due-soon" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Book ceremony venue", Status = "open" }
        );
    }

    private static void SeedCharlotteDetail(OvutorDbContext db, Client client)
    {
        var phases = new[]
        {
            new ChecklistPhase { ClientId = client.Id, Title = "I. Set the foundation", Order = 1 },
            new ChecklistPhase { ClientId = client.Id, Title = "II. Secure your team", Order = 2 },
            new ChecklistPhase { ClientId = client.Id, Title = "III. Shape the celebration", Order = 3 },
            new ChecklistPhase { ClientId = client.Id, Title = "IV. Finalize the details", Order = 4 },
        };
        db.ChecklistPhases.AddRange(phases);
        db.ChecklistTasks.AddRange(
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Set your shared wedding budget", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[1].Id, Title = "Book ceremony venue", Status = "done" },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[2].Id, Title = "Payment reconciliation", Status = "open", DueDate = DateOnly.Parse("2026-08-16"), Priority = "due-soon" }
        );
    }

    private static void SeedMayaEthanDetail(OvutorDbContext db, Client client)
    {
        var phases = new[]
        {
            new ChecklistPhase { ClientId = client.Id, Title = "I. Set the foundation", Order = 1 },
            new ChecklistPhase { ClientId = client.Id, Title = "II. Secure your team", Order = 2 },
            new ChecklistPhase { ClientId = client.Id, Title = "III. Shape the celebration", Order = 3 },
            new ChecklistPhase { ClientId = client.Id, Title = "IV. Finalize the details", Order = 4 },
        };
        db.ChecklistPhases.AddRange(phases);
        db.ChecklistTasks.AddRange(
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Set your shared wedding budget", Status = "open", DueDate = DateOnly.Parse("2026-08-30") },
            new ChecklistTask { ClientId = client.Id, PhaseId = phases[0].Id, Title = "Book venue walkthrough", Status = "open", Priority = "due-soon", DueDate = DateOnly.Parse("2026-08-25") }
        );
    }

    private static readonly (string Key, string Title, string Description)[] SectionTemplate =
    [
        ("hero", "Hero", "Couple names, date, venue and hero photo."),
        ("our-story", "Our Story", "How you met, proposal story, photos."),
        ("details", "Details", "Ceremony, reception, attire and parking cards."),
        ("schedule", "Schedule", "The full run of show for the day."),
        ("travel", "Travel & Stay", "Hotel blocks, transport and local tips."),
        ("gallery", "Guest Photo Sharing", "Gallery guests can browse and contribute to."),
        ("rsvp", "RSVP", "Deadline, plus-one and dietary options."),
    ];

    private static void SeedWebsiteSections(OvutorDbContext db, Client client)
    {
        var statuses = client.Slug switch
        {
            "sofia-daniel" => new[] { "published", "published", "published", "published", "draft", "hidden", "published" },
            "olivia-noah" => new[] { "published", "draft", "draft", "draft", "draft", "draft", "draft" },
            _ => new[] { "draft", "draft", "draft", "draft", "draft", "draft", "draft" },
        };

        for (var i = 0; i < SectionTemplate.Length; i++)
        {
            var (key, title, description) = SectionTemplate[i];
            db.WebsiteSections.Add(new WebsiteSection
            {
                ClientId = client.Id,
                Key = key,
                Order = i + 1,
                Title = title,
                Description = description,
                Status = statuses[i],
            });
        }
    }

    private static void SeedWebsiteContent(OvutorDbContext db, Client client, bool isSofia, bool heroFilledIn = false)
    {
        WebsiteHero hero;
        WebsiteOurStory ourStory;
        List<WebsiteDetailCard> details;
        List<WebsiteScheduleEvent> schedule;
        List<WebsiteTravelItem> travel;
        List<WebsiteGalleryPhoto> gallery;
        WebsiteRsvpConfig rsvp;

        if (isSofia)
        {
            hero = new WebsiteHero("Together with their families", "Sofia & Daniel", "Thursday, September 3, 2026", "The Foundry · Brooklyn, New York", new WebsiteImage(null, "Hero photo"));
            ourStory = new WebsiteOurStory(
                "Our Story", "A shared table, a beautiful life.",
                [
                    "We met over a shared table at a rainy Sunday brunch in Brooklyn. What began as a conversation about travel turned into years of new cities, old songs, and a home full of friends.",
                    "Now, surrounded by the people who shaped us, we are so excited to make our promises and celebrate together.",
                ],
                [new WebsiteStoryMoment("First date", "2019"), new WebsiteStoryMoment("The proposal", "2025")],
                [new WebsiteImage(null, "Sofia and Daniel together"), new WebsiteImage(null, "A shared adventure")]);
            details =
            [
                new WebsiteDetailCard("Ceremony", "4:30 PM", "The Foundry\n42-38 9th Street, Long Island City, NY", "Please arrive by 4:00 PM to be seated."),
                new WebsiteDetailCard("Reception", "5:15 PM–11:00 PM", "On-site at The Foundry", "Cocktails, dinner, and dancing to follow."),
                new WebsiteDetailCard("Attire", "Formal garden party", "", "We recommend comfortable shoes for the lawn and evening layers for the terrace."),
                new WebsiteDetailCard("Parking & arrival", "Easy to find", "", "Complimentary on-site parking is available. Rideshare drop-off is at the north entrance."),
            ];
            schedule =
            [
                new WebsiteScheduleEvent("4:00 PM", "Guest arrival", "Please arrive in time to be seated."),
                new WebsiteScheduleEvent("4:30 PM", "Ceremony", "Garden Pavilion"),
                new WebsiteScheduleEvent("5:15 PM", "Cocktail hour", "West Lawn"),
                new WebsiteScheduleEvent("6:30 PM", "Dinner & toasts", "Foundry Dining Room"),
                new WebsiteScheduleEvent("8:00 PM", "Dancing", "Foundry Dining Room"),
            ];
            travel =
            [
                new WebsiteTravelItem("Hotel block", "The Wythe Hotel is holding a block of rooms under \"Sofia & Daniel\" through August 10."),
                new WebsiteTravelItem("Getting there", "20 minutes from Manhattan by car, or take the L train to Bedford Ave."),
            ];
            gallery =
            [
                new WebsiteGalleryPhoto(null, "A golden afternoon", "A golden afternoon"),
                new WebsiteGalleryPhoto(null, "Our favorite people", "Our favorite people"),
            ];
            rsvp = new WebsiteRsvpConfig("2026-08-20", "We can't wait to celebrate with you. Your response has been received.", true, false);
        }
        else if (heroFilledIn)
        {
            hero = new WebsiteHero("Together with their families", "Olivia & Noah", "Monday, December 14, 2026", "The Glasshouse · New York", new WebsiteImage(null, "Hero photo"));
            (ourStory, details, schedule, travel, gallery, rsvp) = TemplateRest();
        }
        else
        {
            (hero, ourStory, details, schedule, travel, gallery, rsvp) = Template();
        }

        db.WebsiteContents.Add(new WebsiteContent
        {
            ClientId = client.Id,
            HeroJson = JsonSerializer.Serialize(hero, JsonOptions),
            OurStoryJson = JsonSerializer.Serialize(ourStory, JsonOptions),
            DetailsJson = JsonSerializer.Serialize(details, JsonOptions),
            ScheduleJson = JsonSerializer.Serialize(schedule, JsonOptions),
            TravelJson = JsonSerializer.Serialize(travel, JsonOptions),
            GalleryJson = JsonSerializer.Serialize(gallery, JsonOptions),
            RsvpJson = JsonSerializer.Serialize(rsvp, JsonOptions),
        });
    }

    /// <summary>Every field pre-filled with a realistic example — shows the admin what "good" looks like
    /// and doubles as instructions, exactly like the template the frontend used to hardcode.</summary>
    private static (WebsiteHero, WebsiteOurStory, List<WebsiteDetailCard>, List<WebsiteScheduleEvent>, List<WebsiteTravelItem>, List<WebsiteGalleryPhoto>, WebsiteRsvpConfig) Template()
    {
        var hero = new WebsiteHero("Together with their families", "Alex & Taylor", "Saturday, June 6, 2026", "Magnolia Gardens · Austin, Texas", new WebsiteImage(null, "Upload a hero photo — a wide landscape shot of the couple works best"));
        var (ourStory, details, schedule, travel, gallery, rsvp) = TemplateRest();
        return (hero, ourStory, details, schedule, travel, gallery, rsvp);
    }

    private static (WebsiteOurStory, List<WebsiteDetailCard>, List<WebsiteScheduleEvent>, List<WebsiteTravelItem>, List<WebsiteGalleryPhoto>, WebsiteRsvpConfig) TemplateRest()
    {
        var ourStory = new WebsiteOurStory(
            "Our Story", "Replace with your own line, e.g. \"A story worth telling.\"",
            [
                "This is where your story begins — a sentence or two on how you met sets the tone for the whole page.",
                "Add a second paragraph about your journey together, or what led to the proposal.",
            ],
            [new WebsiteStoryMoment("First date", "2019"), new WebsiteStoryMoment("The proposal", "2025")],
            [new WebsiteImage(null, "Add a photo of the two of you"), new WebsiteImage(null, "Add a favorite travel or date photo")]);

        List<WebsiteDetailCard> details =
        [
            new WebsiteDetailCard("Ceremony", "4:30 PM", "Venue name\nStreet address, City, State", "Add any arrival guidance for guests, e.g. \"Please arrive by 4:00 PM to be seated.\""),
            new WebsiteDetailCard("Reception", "5:30 PM–11:00 PM", "Reception location, if different from the ceremony", "e.g. \"Cocktails, dinner, and dancing to follow.\""),
            new WebsiteDetailCard("Attire", "e.g. Formal garden party", "", "Any helpful notes on dress code, weather or footwear."),
            new WebsiteDetailCard("Parking & arrival", "e.g. Easy to find", "", "Parking, rideshare drop-off, or accessibility notes."),
        ];

        List<WebsiteScheduleEvent> schedule =
        [
            new WebsiteScheduleEvent("4:00 PM", "Guest arrival", "Please arrive in time to be seated."),
            new WebsiteScheduleEvent("4:30 PM", "Ceremony", "Add the ceremony location"),
            new WebsiteScheduleEvent("5:30 PM", "Cocktail hour", "Add the location"),
            new WebsiteScheduleEvent("6:30 PM", "Dinner & toasts", "Add the location"),
        ];

        List<WebsiteTravelItem> travel =
        [
            new WebsiteTravelItem("Hotel block", "Add details of a room block or recommended hotel for out-of-town guests."),
            new WebsiteTravelItem("Getting there", "Add directions, parking, or public transport tips."),
        ];

        List<WebsiteGalleryPhoto> gallery =
        [
            new WebsiteGalleryPhoto(null, "Add a favorite photo", "Add a short caption"),
            new WebsiteGalleryPhoto(null, "Add another photo", "Add a short caption"),
        ];

        var rsvp = new WebsiteRsvpConfig("", "We can't wait to celebrate with you. Your response has been received.", true, false);

        return (ourStory, details, schedule, travel, gallery, rsvp);
    }
}
