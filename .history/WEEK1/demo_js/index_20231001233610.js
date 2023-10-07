const KG_PER_KILO = 0.45;
const INCH_TO_METER = 0.0254;

let clients = [
{
    Name : "John",
    Weight : 196,
    Height : 96
},
{
    Name : "Nhàn",
    Weight : 100,
    Height : 96
}]

function getBMI(client) {
    let weightInKilo = client.Weight * KG_PER_KILO;
    let heightInMt = client.Height * INCH_TO_METER;
    
    let BMI = weightInKilo / heightInMt / heightInMt;
    return BMI;
}
for (let i = 0;i<)