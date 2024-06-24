const { default: axios } = require("axios")

const F88ServiceController = {
    pushDocumentRequest: async (req, res, next) => {
        const requestId = new Date().getTime().toString()
        const body = req.body
        try {
            const response = await axios.post('https://api-ida-pn.f88.co/api/v1/POL/AddNewForm', {
                PartnerCode: "VNFITE",
                RequestId: requestId,
                Data: [
                    {
                        AssetTypeId: 20,
                        CampaignId: 2,
                        PhoneNumber: body.phoneNumber,
                        TrackingId: "",
                        SourceId: 374,
                        FullName: body.fullname
                    }
                ]
            });
            res.json(response.data)
        } catch (error) {
            res.send(error)
        }
    }
}

module.exports = F88ServiceController