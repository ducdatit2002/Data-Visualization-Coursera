const KG_PER_KILO = 0.45;
const INCH_TO_METER = 0.0254;

let client = {
    Name : "John",
    Weight : 196,
    Height : 96
}


function getBMI(client) {
    let weightInKilo = Weight * KG_PER_KILO;
    let heightInMt = Height * INCH_TO_METER;
    
    let BMI = weightInKilo / heightInMt / heightInMt;
    return BMI;
}


document.write(client.Name + ": "+ getBMI(client);