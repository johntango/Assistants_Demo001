async function getCountry(name) {
    const url = `https://api.nationalize.io?name=${name}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

