import chalk from "chalk";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(process.env.DATABASE_URL);
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(
      chalk.green.bold(
        `MongoDB connected Successfully: ${conn.connection.host} ✅`
      )
    );
  } catch (err) {
    console.log(
      chalk.red.bold(`error happened for connecting database ❌`),
      err
    );
    process.exit(1);
  }
};

export default connectDB;
