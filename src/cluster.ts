import cluster from "cluster";
import os from "os";

import mainServer from ".";

if (cluster.isPrimary) {
    const cpus = os.cpus().length;

    console.log(`Forking for ${cpus - 7} CPUs`);
    for (let i = 0; i < cpus - 7; i++ ) {
        cluster.fork();
    }
}
else {
    mainServer();
}