import User from "../models/User.js";


export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};


export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};