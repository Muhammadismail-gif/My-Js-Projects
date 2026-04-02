function calculateAge() {
    let dob = document.getElementById("dob").value;
    if (dob === "") {
        document.getElementById("result").innerText = "Please enter a valid date.";
        return;
    }

    let birthDate = new Date(dob);
    let today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    let monthDiff = today.getMonth() - birthDate.getMonth();
    let dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    document.getElementById("result").innerText = `Your Age is: ${age} years`;
}
