import app from "./app";
import { PORT } from "./config/env";

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

