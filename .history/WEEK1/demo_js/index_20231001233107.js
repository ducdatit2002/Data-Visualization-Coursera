const KG_PER_KILO = 0.45;
const INCH_TO_METER = 0.0254;

let client = {
    let Name = "John";
let Weight = 196;
let Height = 96;
}


function getBMI(client) {
    let weightInKilo = Weight * KG_PER_KILO;
    let heightInMt = Height * INCH_TO_METER;
    
    let BMI = weightInKilo / heightInMt / heightInMt;
    return BMI;
}


document.write(Name + ": "+ BMI);