document.addEventListener("DOMContentLoaded", function () {
    const actionSelect = document.getElementById("action-select");
    const recipientContainer = document.getElementById("recipient-container");

    // Show or hide recipient field based on action
    actionSelect.addEventListener("change", function () {
        if (this.value === "transfer") {
            recipientContainer.classList.remove("hidden");
        } else {
            recipientContainer.classList.add("hidden");
        }
    });

    // Handle form submission with fetch
    const actionsForm = document.getElementById("actions-form");
    actionsForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(actionsForm);
        const actionData = Object.fromEntries(formData);

        try {
            const response = await fetch("/dashboard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(actionData),
            });

            const result = await response.json();
            if (result.success) {
                alert("Action completed successfully!");
                location.reload();
            } else {
                alert("Error performing action. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
