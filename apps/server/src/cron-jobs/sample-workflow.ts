// import { BackendPostgres } from "@openworkflow/backend-postgres";
// import { OpenWorkflow } from "openworkflow";

// const postgresUrl = process.env.DATABASE_URL;
// const backend = await BackendPostgres.connect(postgresUrl);
// const ow = new OpenWorkflow({ backend });

// const sendWelcomeEmail = ow.defineWorkflow(
//     { name: "send-welcome-email" },
//     async ({ input, step }) => {
//         const user = await step.run({ name: "fetch-user" }, async () => {
//             return await db.users.findOne({ id: input.userId });
//         });

//         await step.run({ name: "send-email" }, async () => {
//             return await resend.emails.send({
//                 from: "me@example.com",
//                 to: user.email,
//                 replyTo: "me@example.com",
//                 subject: "Welcome!",
//                 html: "<h1>Welcome to our app!</h1>",
//             });
//         });

//         await step.run({ name: "mark-welcome-email-sent" }, async () => {
//             await db.users.update(input.userId, { welcomeEmailSent: true });
//         });

//         return { user };
//     },
// );
