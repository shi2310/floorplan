export default {
  'POST /api/floor-plan': (req, res) => {
    console.log('MOCK模拟接收：');
    console.log(req.body);
    res.status(200).send(null);
  },
};
