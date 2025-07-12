import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
    uploader,
} from "../../../shared/middleware";
import { EventBus } from "../../../shared/util";
import {
    DaftarUlangModel,
    DiscountModel,
    PaymentFileModel,
    PaymentProofModel,
    StudentBillsModel,
    UserBillPaymentsModel,
} from "../infrastructure/migration";
import { PaymentProofQueryHandler } from "../infrastructure/storage/query";
import {
    DaftarUlangRepository,
    DiscountRepository,
    PaymentProofRepository,
    StudentBillsRepository,
    UserBillPaymentsRepository,
} from "../infrastructure/storage/repository";
import {
    DaftarUlangController,
    DiscountController,
    PaymentProofController,
    StudentBillsController,
    UserBillPaymentsController,
} from "./controller";
import { SiswaModel } from "../../siswa/infrastructure/migration";
import { SPPModel } from "../infrastructure/migration/spp-table";
import { SPPRepository } from "../infrastructure/storage/repository/spp.repository";
import { SPPController } from "./controller/spp.controller";
import e from "express";

export const setPaymentProofRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["file_pembayaran"] = PaymentFileModel;
    dbConn.models["bukti_pembayaran"] = PaymentProofModel;
    dbConn.models["students"] = SiswaModel;
    dbConn.models["spp"] = SPPModel;
    dbConn.models["discount"] = DiscountModel;
    dbConn.models["student_bills"] = StudentBillsModel;
    dbConn.models["user_bill_payments"] = UserBillPaymentsModel;
    dbConn.models["daftar_ulang"] = DaftarUlangModel;

    UserBillPaymentsModel.belongsTo(StudentBillsModel, {
        foreignKey: {
            name: "id_student_bill",
            allowNull: false,
        },
    });

    StudentBillsModel.hasMany(UserBillPaymentsModel, {
        foreignKey: {
            name: "id_student_bill",
            allowNull: false,
        },
    });

    UserBillPaymentsModel.belongsTo(PaymentProofModel, {
        foreignKey: {
            name: "id_payment_proof",
            allowNull: false,
        },
    });

    PaymentProofModel.hasMany(UserBillPaymentsModel, {
        foreignKey: {
            name: "id_payment_proof",
            allowNull: false,
        },
    });

    StudentBillsModel.belongsTo(DiscountModel, {
        foreignKey: {
            name: "id_discount",
            allowNull: true,
        },
    });

    DiscountModel.hasMany(StudentBillsModel, {
        foreignKey: {
            name: "id_discount",
            allowNull: true,
        },
    });

    StudentBillsModel.belongsTo(SiswaModel, {
        foreignKey: {
            name: "id_student",
            allowNull: false,
        },
    });

    SiswaModel.hasMany(StudentBillsModel, {
        foreignKey: {
            name: "id_student",
            allowNull: false,
        },
    });

    PaymentProofModel.belongsTo(SiswaModel, {
        foreignKey: {
            name: "id_student",
            allowNull: false,
        },
    });

    SiswaModel.hasMany(PaymentProofModel, {
        foreignKey: {
            name: "id_student",
            allowNull: false,
        },
    });
    PaymentFileModel.hasOne(PaymentProofModel, {
        foreignKey: {
            name: "id_file_pembayaran",
            allowNull: false,
        },
    });
    PaymentProofModel.belongsTo(PaymentFileModel, {
        foreignKey: {
            name: "id_file_pembayaran",
            allowNull: false,
        },
    });
    const paymentProofRepository = new PaymentProofRepository(dbConn);
    const paymentProofQuery = new PaymentProofQueryHandler(dbConn);
    const paymentProofController = new PaymentProofController(
        paymentProofRepository,
        paymentProofQuery,
        eventBus,
    );

    const studentBillsRepository = new StudentBillsRepository(dbConn);
    const studentBillsController = new StudentBillsController(studentBillsRepository, eventBus);

    const discountRepository = new DiscountRepository(dbConn);
    const discountController = new DiscountController(discountRepository, studentBillsRepository);
    
    const sppRepository = new SPPRepository(dbConn);
    const sppController = new SPPController(
        sppRepository,
        studentBillsRepository,
        discountRepository,
        eventBus,
    );

    const userBillPaymentRepository = new UserBillPaymentsRepository(dbConn);
    const userBillPaymentsController = new UserBillPaymentsController(
        userBillPaymentRepository,
        studentBillsRepository,
        paymentProofRepository,
    );

    const daftarUlangRepository = new DaftarUlangRepository(dbConn);
    const daftarUlangController = new DaftarUlangController(
        daftarUlangRepository,
        studentBillsRepository,
        discountRepository,
        eventBus,
    );

    const paymentProofRouter = express.Router();

    paymentProofRouter.post(
        "",
        uploader.single("bukti_pembayaran"),
        expressAsyncHandler(
            paymentProofController.uploadPaymentProof.bind(
                paymentProofController,
            ),
        ),
    );

    paymentProofRouter.use(middlewareAuthentication);
    paymentProofRouter.post(
        "/spp",
        restrictedTo("Orang Tua"),
        uploader.single("bukti_pembayaran"),
        expressAsyncHandler(
            userBillPaymentsController.settleUserBillPayments.bind(
                userBillPaymentsController,
            ),
        ),
    );

    paymentProofRouter.post(
        "/daftar-ulang",
        restrictedTo("Orang Tua"),
        uploader.single("bukti_pembayaran"),
        expressAsyncHandler(
            userBillPaymentsController.settleUserDaftarUlangBillPayments.bind(
                userBillPaymentsController,
            ),
        ),
    );

    paymentProofRouter.post(
        "/spp/user-bill/status/:id",
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            userBillPaymentsController.updateStatusPayment.bind(
                userBillPaymentsController,
            ),
        ),
    )

    paymentProofRouter.post(
        "/daftar-ulang/user-bill/status/:id",
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            userBillPaymentsController.updateStatusDaftarUlangPayment.bind(
                userBillPaymentsController,
            ),
        ),
    )

    paymentProofRouter.post(
        "/spp/student-bill/status/:id",
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            studentBillsController.updateStatusStudentBill.bind(
                studentBillsController,
            ),
        ),
    )

    paymentProofRouter.post(
        "/daftar-ulang/student-bill/status/:id",
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            studentBillsController.updateStatusDaftarUlangStudentBill.bind(
                studentBillsController,
            ),
        ),
    )

    paymentProofRouter.get(
        "/spp",
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            sppController.getSPPBill.bind(
                sppController,
            ),
        )
    )

    paymentProofRouter.get(
        "/spp/history",
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            userBillPaymentsController.getHistoryPayments.bind(
                userBillPaymentsController,
            ),
        )
    )

    paymentProofRouter.get(
        "/discount",
        restrictedTo("Bendahara", "Sekretaris", "Orang Tua", "Admin"),
        expressAsyncHandler(
            sppController.getDiscounts.bind(
                sppController,
            ),
        )
    )
        

    paymentProofRouter.get(
        '/orang_tua/bill',
        restrictedTo("Orang Tua"),
        expressAsyncHandler(
            studentBillsController.getBillByParentId.bind(
                studentBillsController,
            ),
        ),
    )

    paymentProofRouter.get(
        '/orang_tua/daftar-ulang-bill',
        restrictedTo("Orang Tua"),
        expressAsyncHandler(
            studentBillsController.getDaftarUlangBillByParentId.bind(
                studentBillsController,
            ),
        ),
    )

    paymentProofRouter.get(
        '/spp/student-bills',
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            studentBillsController.getAllStudentBills.bind(
                studentBillsController,
            ),
        ),
    )

    paymentProofRouter.get(
        '/daftar-ulang/student-bills',
        restrictedTo("Bendahara", "Sekretaris", "Admin"),
        expressAsyncHandler(
            studentBillsController.getAllDaftarUlangStudentBills.bind(
                studentBillsController,
            ),
        ),
    )

    paymentProofRouter.delete(
        '/spp/history',
        restrictedTo("Admin"),
        expressAsyncHandler(
            userBillPaymentsController.deleteAllHistoryPayments.bind(
                userBillPaymentsController,
            ),
        ),
    )

    paymentProofRouter.delete(
        '/spp/history/:id',
        restrictedTo("Admin"),
        expressAsyncHandler(
            userBillPaymentsController.deleteHistoryPaymentById.bind(
                userBillPaymentsController,
            ),
        ),
    )

    paymentProofRouter.get(
        '/orang_tua/history',
        restrictedTo("Orang Tua"),
        expressAsyncHandler(
            userBillPaymentsController.getHistoryPayment.bind(
                userBillPaymentsController,
            ),
        ),
    )

    paymentProofRouter.get(
        '/orang_tua/history-daftar-ulang',
        restrictedTo("Orang Tua"),
        expressAsyncHandler(
            userBillPaymentsController.getDaftarUlangHistoryPaymentByParents.bind(
                userBillPaymentsController,
            ),
        ),
    )

    paymentProofRouter.get(
        '/daftar-ulang/history',
        restrictedTo("Sekretaris", "Bendahara", "Admin"),
        expressAsyncHandler(
            userBillPaymentsController.getDaftarUlangHistoryPayment.bind(
                userBillPaymentsController,
            ),
        ),
    )

    paymentProofRouter.post(
        "/add-spp",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(sppController.addSPPBill.bind(sppController)),
    );

    paymentProofRouter.get(
        "",
        restrictedTo(
            "Manajer",
            "Administrator Keuangan",
            "Sekretaris",
            "Front Office",
            "Akademik",
            "Admin",
        ),
        expressAsyncHandler(
            paymentProofController.viewAllPaymentProofs.bind(
                paymentProofController,
            ),
        ),
    );

    paymentProofRouter.post(
        "/spp",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(sppController.addSPPBill.bind(sppController)),
    );

    paymentProofRouter.put(
        "/spp/:id",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(sppController.editSPPBillById.bind(sppController)),
    );

    paymentProofRouter.delete(
        "/spp/:id",
        restrictedTo("Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(sppController.deleteSPPBillById.bind(sppController)),
    );

    paymentProofRouter.post(
        "/discount",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            discountController.addDiscount.bind(discountController),
        ),
    );

    paymentProofRouter.put(
        "/discount/:id",
        restrictedTo("Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(
            sppController.editDiscount.bind(sppController),
        ),
    );

    paymentProofRouter.delete(
        "/discount/:id",
        restrictedTo("Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(
            discountController.deleteDiscountById.bind(discountController),
        ),
    );

    paymentProofRouter.get(
        "/daftar-ulang",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            daftarUlangController.getAllDaftarUlang.bind(daftarUlangController),
        ),
    );

    paymentProofRouter.post(
        "/add-daftar-ulang",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            daftarUlangController.addDaftarUlang.bind(daftarUlangController),
        ),
    );

    paymentProofRouter.delete(
        "/daftar-ulang/:id",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            daftarUlangController.deleteDaftarUlang.bind(daftarUlangController),
        ),
    );

    paymentProofRouter.put(
        "/daftar-ulang/:id",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            daftarUlangController.updateDaftarUlang.bind(daftarUlangController),
        ),
    );

    paymentProofRouter.post(
        "/student-bills",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            studentBillsController.addStudentBills.bind(studentBillsController),
        ),
    );

    paymentProofRouter.get(
        "/student-bills",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            studentBillsController.getBillByStudentId.bind(
                studentBillsController,
            ),
        ),
    );

    paymentProofRouter.get(
        "/student-bills/tagihan",
        restrictedTo("Admin", "Sekretaris", "Bendahara", "Guru"),
        expressAsyncHandler(
            studentBillsController.getBillByTagihanId.bind(
                studentBillsController,
            ),
        ),
    );

    paymentProofRouter.put(
        "/:id",
        uploader.single("bukti_pembayaran"),
        restrictedTo("Front Office", "Akademik"),
        expressAsyncHandler(
            paymentProofController.updatePaymentProof.bind(
                paymentProofController,
            ),
        ),
    );

    paymentProofRouter.delete(
        "/:id",
        restrictedTo("Front Office", "Akademik"),
        expressAsyncHandler(
            paymentProofController.deletePaymentProof.bind(
                paymentProofController,
            ),
        ),
    );

    return paymentProofRouter;
};
