import Admin  from "./../data/models/Admin";


async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const firstname = process.env.ADMIN_FIRSTNAME;
    const lastname = process.env.ADMIN_LASTNAME;

    try{
        const existing = await Admin.findOne({ email });
        if (!existing) {
            await Admin.create({
                email,
                firstName: firstname,
                lastName: lastname,
                locale: "en",
                oauthProvider: "google",
            });
            console.log("Admin seeded successfully");
        } else {
            console.log("Admin already exists, move along");
    }
        }catch (err) {
        console.error("Error seeding admin:", err.message);
    }
}
export default seedAdmin;
