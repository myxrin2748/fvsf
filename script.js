function readJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch {
        reject("JSON invalid");
      }
    };
    reader.readAsText(file);
  });
}

// 🔥 AMBIL SEMUA USERNAME DARI FILE APAPUN
function extractAllUsernames(obj, result = new Set()) {
  if (Array.isArray(obj)) {
    obj.forEach(item => extractAllUsernames(item, result));
  } else if (typeof obj === "object" && obj !== null) {
    // ambil username dari value
    if (
      Array.isArray(obj.string_list_data) &&
      obj.string_list_data[0]?.value
    ) {
      result.add(obj.string_list_data[0].value);
    }

    // lanjut telusuri
    for (const key in obj) {
      extractAllUsernames(obj[key], result);
    }
  }
  return result;
}

// FOLLOWING KHUSUS (PAKAI title)
function extractFollowing(section) {
  if (!Array.isArray(section)) return [];
  return section
    .map(item => item.title)
    .filter(Boolean);
}

async function checkNotFollowBack() {
  try {
    const followingFile = document.getElementById("followingFile").files[0];
    const followersFile = document.getElementById("followersFile").files[0];

    if (!followingFile || !followersFile) {
      alert("Upload following.json dan followers_1.json");
      return;
    }

    const followingJSON = await readJSON(followingFile);
    const followersJSON = await readJSON(followersFile);

    const following = extractFollowing(
      followingJSON.relationships_following
    );

    if (following.length === 0) {
      alert("File following.json tidak valid");
      return;
    }

    // 🔥 AMBIL FOLLOWERS TANPA PEDULI STRUKTUR
    const followers = Array.from(
      extractAllUsernames(followersJSON)
    );

    const notFollowBack = following.filter(
      u => !followers.includes(u)
    );

    const result = document.getElementById("result");
    const resultSection = document.getElementById("resultSection");

    result.innerHTML = "";
    resultSection.classList.remove("hidden");

    if (notFollowBack.length === 0) {
      result.innerHTML = "<li>Semua akun kamu follow balik 🎉</li>";
    } else {
      notFollowBack.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        result.appendChild(li);
      });
    }

    console.log("Following:", following.length);
    console.log("Followers (detected):", followers.length);
    console.log("Not follow back:", notFollowBack.length);

  } catch (e) {
    console.error(e);
    alert("Gagal membaca file JSON");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("checkBtn")
    .addEventListener("click", checkNotFollowBack);
});
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("guidePopup");
  const closeBtn = document.getElementById("closeGuide");

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });
});
