
document.addEventListener("DOMContentLoaded", function () {

    const counters = [
        { id: "odometer1", target: 5 },
        { id: "odometer2", target: 8075 },
        { id: "odometer3", target: 170 },
        { id: "odometer4", target: 80 }
    ];

    counters.forEach(function (counter, index) {

        const element = document.getElementById(counter.id);

        if (!element) {
            return;
        }

        const target = counter.target;
        const duration = 1800;

        // Start each counter slightly after the previous one
        setTimeout(function () {

            const startTime = performance.now();

            function animate(currentTime) {

                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Smooth deceleration at the end
                const easedProgress = 1 - Math.pow(1 - progress, 3);

                const currentValue = Math.floor(easedProgress * target);

                element.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = target;
                }
            }

            requestAnimationFrame(animate);

        }, index * 150);

    });

});

