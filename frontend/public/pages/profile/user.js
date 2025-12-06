const estadoDeCuentaSpan = document.getElementById("account-state");
let minecraftData = []
let userData = []


///On page ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        minecraftData = await getMinecraftData()
        userData = await getUserData()
        
    } finally {
        updateStats();
    }

})


async function getMinecraftData() {
    const request = await fetch('/api/get_minecraft_data', {
        method: "GET"
    }) 

    const data =  await request.json()
    return data;
}

async function getUserData() {
    const request = await fetch('/api/get_my_data', {
        method: "GET"
    }) 

    let user =  await request.json()
    return user;
}

function updateStats() {
    updateFinances()
}

function updateFinances() {
    let debtMonths = userData.payement.debtMonths;
    if (debtMonths.length > 0){
        console.log("Youre in debt")
    }
}