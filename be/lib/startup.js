const User = require("../models/User");
const PaymentGateway = require("../models/paymentGateway");

const createAdminUser = async () => {
    try {
        const adminUsername = "nanda";
        const adminEmail = "nanda@example.com";
        const adminPassword = "nanda";
        const adminRole = "admin";

        const existingAdmin = await User.findOne({ username: adminUsername });
        if (existingAdmin) {
            console.log("Admin user already exists");
            return;
        }

        const adminUser = new User({
            username: adminUsername,
            email: adminEmail,
            password: adminPassword,
            role: adminRole
        });

        await adminUser.save();
        console.log("Admin user created successfully");
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
};

const createPaymentGateway = async () => {
    try {
        const paymentGatewayCode = "tripay";
     

        const existingPaymentGateway = await PaymentGateway.findOne({ code: paymentGatewayCode });
        if (existingPaymentGateway) {
            console.log("Payment gateway already exists");
            return;
        } 

        const paymentGateway = new PaymentGateway({
            code: paymentGatewayCode,
           
        });

        await paymentGateway.save();
        console.log("Payment gateway created successfully");
    } catch (error) {
        console.error("Error creating payment gateway:", error);
    }
}


module.exports = {
    createAdminUser,
    createPaymentGateway
};
