const TomSelect = require("tom-select");
const axios = require("axios");

const config = require("../configs/configs");

const prepare = require("../utils/prepare");
const Modal = require("../utils/modal");
const EncacapForm = require("../utils/form");

prepare(async (request) => {
    const addLocationButton = document.getElementById("addNewLocationButton");
    const addLocationModal = new Modal("#addNewLocationModal");

    addLocationButton.onclick = async () => {
        const addLocationForm = new EncacapForm("#addNewLocationForm");
        const TSCitiesSelect = new TomSelect("#city", {
            maxItems: 1,
            selectOnTab: true,
            maxOptions: 6,
        });
        const TSDistrictsSelect = new TomSelect("#district", {
            maxItems: 1,
            selectOnTab: true,
            maxOptions: 6,
        });
        const TSWardSelect = new TomSelect("#ward", {
            maxItems: 1,
            selectOnTab: true,
            maxOptions: 6,
        });
        const citySelect = addLocationForm.querySelector(`[name="city"]`);
        const districtSelect = addLocationForm.querySelector(`[name="district"]`);
        const closeButton = addLocationForm.querySelector(".modal-close");

        addLocationModal.show();
        addLocationForm.disable();

        closeButton.enable();

        addLocationForm.validate({
            city: [
                {
                    role: "required",
                    message: "Tên tỉnh, thành phố không được phép để trống",
                },
            ],
            district: [
                {
                    role: "required",
                    message: "Tên quận, huyện không được phép để trống",
                },
            ],
            ward: [
                {
                    role: "required",
                    message: "Tên xã, phường, thị trấn không được phép để trống",
                },
            ],
        });

        citySelect.loading.show();
        axios
            .get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
                headers: {
                    token: config.GHN_TOKEN,
                },
            })
            .then((response) => {
                const { data } = response.data;
                citySelect.loading.hide();
                citySelect.enable();
                TSCitiesSelect.addOptions(
                    data.map((city) => ({
                        value: city.ProvinceID,
                        text: city.ProvinceName,
                    }))
                );
            })
            .catch((error) => {
                addLocationForm.showError("Đã xảy ra lỗi khi tải dữ liệu tỉnh, thành phố", error);
            });

        citySelect.onchange = async () => {
            const cityId = citySelect.value;
            districtSelect.loading.show();
            try {
                const {
                    data: { data: districts },
                } = await axios.post(
                    "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
                    {
                        province_id: Number(cityId),
                    },
                    {
                        headers: {
                            token: config.GHN_TOKEN,
                        },
                    }
                );
                TSDistrictsSelect.addOptions(
                    districts.map((district) => ({ value: district.DistrictID, text: district.DistrictName }))
                );
                districtSelect.loading.hide();
                districtSelect.enable();
            } catch (error) {
                console.log(error.response.data);
            }
        };
    };
});
