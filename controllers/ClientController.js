const Client = require("../models/client/client");

const getClient = async (req, res) => {
  const { clientCode } = req.params;

  try {
    const client = await Client.findOne({ clientCode });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const clientData = {
      clientCode: client.clientCode,
      client: client.client,
      address: client.address,
      contactPerson: client.contactPerson ?? "",
      contactNumber: client.contactNumber ?? "",
      email: client.email ?? "",
      clientLocation: client.clientLocation ?? "",
      openDays: client.openDays ?? [],
    };

    res.json(clientData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateClient = async (req, res) => {
  const { clientCode } = req.params;
  const {
    client,
    address,
    contactPerson,
    contactNumber,
    email,
    clientLocation,
    openDays,
  } = req.body;

  try {
    const clientToUpdate = await Client.findOneAndUpdate(
      { clientCode },
      {
        client,
        address,
        contactPerson,
        contactNumber,
        email,
        clientLocation,
        openDays,
      },
      { new: true }
    );

    if (!clientToUpdate) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(clientToUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getClient,
  updateClient,
};
