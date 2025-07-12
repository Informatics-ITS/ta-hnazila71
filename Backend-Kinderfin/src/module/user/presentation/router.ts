import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
} from "../../../shared/middleware";
import { EventBus } from "../../../shared/util";
import { GuruModel, OrangTuaModel, SalaryModel, UserModel } from "../infrastructure/migration";
import { SalaryQueryHandler, UserQueryHandler } from "../infrastructure/storage/query";
import { SalaryRepository, UserRepository } from "../infrastructure/storage/repository";
import { SalaryController, UserController } from "./controller";

// Import MasterJabatanModel
import { MasterJabatan } from '../../master_jabatan/domain/entity/master_jabatan.entity';

export const setUserRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["user"] = UserModel;
    dbConn.models["gaji"] = SalaryModel;
    dbConn.models["parents"] = OrangTuaModel;
    dbConn.models["teachers"] = GuruModel;
    dbConn.models["master_jabatan"] = MasterJabatan; // Daftarkan MasterJabatanModel

    // Asosiasi yang sudah ada untuk user dan gaji
    dbConn.models["user"].hasMany(dbConn.models["gaji"], {
        foreignKey: {
            name: "id_user",
            allowNull: false,
        },
    });
    dbConn.models["gaji"].belongsTo(dbConn.models["user"], {
        foreignKey: {
            name: "id_user",
            allowNull: false,
        },
    });

    // START: Asosiasi untuk teachers dan master_jabatan (DEFINISI DUPLIKAT DIHAPUS)
    // Asosiasi ini didefinisikan secara global di master_jabatan/presentation/router.ts
    // atau di file asosiasi sentral lainnya.
    // Hanya daftarkan model-modelnya di sini.
    // END: Asosiasi untuk teachers dan master_jabatan

    const userRepository = new UserRepository(dbConn);
    const userQuery = new UserQueryHandler(dbConn);
    const userController = new UserController(
        userRepository,
        userQuery,
        eventBus,
    );
    const salaryRepository = new SalaryRepository(dbConn);
    const salaryQuery = new SalaryQueryHandler(dbConn);
    const salaryController = new SalaryController(salaryRepository, salaryQuery, eventBus)
    const userRouter = express.Router();

    userRouter.post(
        "/login",
        expressAsyncHandler(userController.login.bind(userController)),
    );
    userRouter.post(
        "/orang-tua",
        expressAsyncHandler(userController.addOrangTua.bind(userController)),
    );


    userRouter.use(middlewareAuthentication);

    userRouter.post(
        "/logout",
        expressAsyncHandler(userController.logout.bind(userController)),
    );

    userRouter.get(
        "/profile",
        expressAsyncHandler(
            userController.viewUserProfile.bind(userController),
        ),
    );

    userRouter.post(
        "/",
        restrictedTo("Admin", "Bendahara", "Sekretaris"),
        expressAsyncHandler(userController.addUser.bind(userController)),
    );

    userRouter.post(
        "/guru",
        restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(userController.addGuru.bind(userController)),
    );
    
    userRouter.post(
        "/reset-password",
        restrictedTo("Admin"), // sesuaikan jika perlu
        expressAsyncHandler(userController.resetPassword.bind(userController)),
    );


    userRouter.get(
        "",
        restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara", "Admin"),
        expressAsyncHandler(userController.viewAllUsers.bind(userController)),
    );

    userRouter.get(
        "/guru",
        restrictedTo("Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(userController.getAllGuru.bind(userController)),
    )

    userRouter.put(
        "/:id",
        restrictedTo("Admin"),
        expressAsyncHandler(userController.updateUser.bind(userController)),
    );

    userRouter.delete(
        "/:id",
        restrictedTo("Admin", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(userController.deleteUser.bind(userController)),
    );

    return userRouter;
};
