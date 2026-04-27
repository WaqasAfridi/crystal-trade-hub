import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { badRequest, conflict, notFound } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { upload } from "../../middleware/upload";

const router = Router();
router.use(requireUser);

// Get my KYC (or null)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const kyc = await prisma.kyc.findUnique({ where: { userId: req.userId } });
    return ok(res, kyc);
  }),
);

// Submit KYC. multipart/form-data with fields:
//   country, documentType, fullName, dateOfBirth, idNumber
//   files: front, back (and optionally selfie)
router.post(
  "/submit",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const existing = await prisma.kyc.findUnique({ where: { userId: req.userId } });
    if (existing && existing.status === "APPROVED") throw conflict("KYC already approved");

    const { country, documentType, fullName, dateOfBirth, idNumber } = req.body as Record<string, string>;
    if (!country || !documentType || !fullName || !dateOfBirth || !idNumber) {
      throw badRequest("All KYC fields are required");
    }

    const files = req.files as Record<string, Express.Multer.File[]>;
    const front = files?.front?.[0];
    const back = files?.back?.[0];
    const selfie = files?.selfie?.[0];
    if (!front) throw badRequest("Front image is required");

    const data = {
      country,
      documentType,
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      idNumber,
      frontImagePath: front.path,
      backImagePath: back ? back.path : null,
      selfieImagePath: selfie ? selfie.path : null,
      status: "PENDING" as const,
      rejectionReason: null,
    };

    const kyc = existing
      ? await prisma.kyc.update({ where: { userId: req.userId }, data })
      : await prisma.kyc.create({ data: { ...data, userId: req.userId! } });

    return created(res, kyc, "KYC submitted, awaiting review");
  }),
);

export default router;
